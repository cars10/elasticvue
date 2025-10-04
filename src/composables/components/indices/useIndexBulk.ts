import { computed, ref, Ref } from 'vue'
import { QMenu, useQuasar } from 'quasar'
import { useTranslation } from '../../i18n'
import { useElasticsearchAdapter } from '../../CallElasticsearch'
import { askConfirm } from '../../../helpers/dialogs'
import JSZip from 'jszip'

export const useIndexBulk = (props: { selectedIndices: string[] }, emit: (event: 'reload' | 'indicesDeleted') => void) => {
  const t = useTranslation()
  const $q = useQuasar()
  const { callElasticsearch } = useElasticsearchAdapter()
  const menu: Ref<QMenu | null> = ref(null)

  const emitAndCloseMenu = (event: 'reload' | 'indicesDeleted') => {
    emit(event)
    menu.value?.hide()
  }

  // --- clear --- 
  const progressDialogVisible = ref(false)
  const progressStatus = ref('')
  const progressProcessed = ref(0)
  const progressTotal = ref(0)
  const progressPercentage = computed(() => {
    if (progressTotal.value === 0) return 0
    return Math.round((progressProcessed.value / progressTotal.value) * 100)
  })

  const startClear = async () => {
    const confirmed = await askConfirm(t('indices.index_row.options.clear.confirm', { index: props.selectedIndices.join(', ') }))
    if (!confirmed) return

    progressDialogVisible.value = true
    progressStatus.value = t('indices.index_clear.progress.preparing')
    progressProcessed.value = 0
    progressTotal.value = 0

    try {
      await callElasticsearch('indexClear', {
        indices: props.selectedIndices,
        onProgress: (progress: { processed: number, total: number, percentage: number, status: string }) => {
          progressProcessed.value = progress.processed
          progressTotal.value = progress.total
          if (progress.status === 'Completed') {
            progressStatus.value = t('indices.index_clear.progress.completed')
            emitAndCloseMenu('reload')
          } else {
            progressStatus.value = t('indices.index_clear.progress.clearing_documents', {
              processed: progress.processed,
              total: progress.total
            })
          }
        }
      })
    } catch (e) {
      console.log(e)
      $q.notify({
        type: 'negative',
        message: 'Error while clearing indices.'
      })
      closeProgressDialog()
    }
  }

  const closeProgressDialog = () => {
    progressDialogVisible.value = false
  }

  // --- bulk export ---
  const bulkExportProgressDialogVisible = ref(false)
  const bulkExportProgress = ref({
    total: 0,
    current: 0,
    currentIndex: '',
    fileProgress: 0
  })

  const startBulkExport = async () => {
    const confirmed = await askConfirm(t('indices.index_bulk.export.confirm', { count: props.selectedIndices.length }))
    if (!confirmed) return

    menu.value?.hide()
    bulkExportProgressDialogVisible.value = true
    bulkExportProgress.value.total = props.selectedIndices.length
    bulkExportProgress.value.current = 0

    for (const index of props.selectedIndices) {
      bulkExportProgress.value.current++
      bulkExportProgress.value.currentIndex = index
      bulkExportProgress.value.fileProgress = 0

      try {
        const result = await callElasticsearch('indexDump', {
          index,
          onProgress: (progress: { processed: number, total: number, percentage: number }) => {
            bulkExportProgress.value.fileProgress = progress.percentage
          }
        })

        if (!result.success) {
          $q.notify({ type: 'negative', message: `Error exporting ${index}: ${result.error}` })
          continue
        }

        const dumpData = {
          index: index,
          timestamp: new Date().toISOString(),
          version: '1.0',
          mapping: result.mapping,
          documents: result.data,
          total: result.total
        }

        const zip = new JSZip()
        zip.file('index_dump.json', JSON.stringify(dumpData, null, 2))

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const fileName = `${index}_dump_${new Date().toISOString().split('T')[0]}.zip`

        const url = URL.createObjectURL(zipBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

      } catch (error) {
        $q.notify({ type: 'negative', message: `Error exporting ${index}: ${error}` })
      }
    }

    bulkExportProgressDialogVisible.value = false
    $q.notify({ type: 'positive', message: t('indices.index_bulk.export.growl') })
  }

  return {
    menu,
    emitAndCloseMenu,
    progressDialogVisible,
    progressStatus,
    progressProcessed,
    progressTotal,
    progressPercentage,
    startClear,
    closeProgressDialog,
    bulkExportProgressDialogVisible,
    bulkExportProgress,
    startBulkExport
  }
}
