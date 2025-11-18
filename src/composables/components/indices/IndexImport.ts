import { ref, computed, onMounted, watch } from 'vue'
import JSZip from 'jszip'
import { useSnackbar } from '../../Snackbar'
import { useTranslation } from '../../i18n'
import { RequestState, useElasticsearchAdapter } from '../../CallElasticsearch'

export const useIndexImport = (emit: any) => {
  const { showSnackbar } = useSnackbar()
  const t = useTranslation()

  // Adapter Elasticsearch
  const { callElasticsearch } = useElasticsearchAdapter()

  // État des dialogs
  const importDialogVisible = ref(false)
  const progressDialogVisible = ref(false)

  // Sélection de fichier
  const selectedFile = ref<File | null>(null)
  const filePreview = ref<any>(null)

  // Options d'import
  const isRawImport = ref(false)
  const importMode = ref<'new' | 'existing'>('new')
  const newIndexName = ref('')
  const selectedExistingIndex = ref('')
  const overwriteExisting = ref(false)

  const fileInputAccept = computed(() => (isRawImport.value ? '.json' : '.json,.zip'))
  const fileInputLabel = computed(() => (isRawImport.value ? t('indices.import.select_raw_file') : t('indices.import.select_file')))

  // Liste des indices existants
  const existingIndices = ref<string[]>([])

  // État de l'import
  const importing = ref(false)
  const importCompleted = ref(false)
  const importError = ref('')
  const importErrors = ref<any[]>([])
  const progressStatus = ref('')
  const progressProcessed = ref(0)
  const progressTotal = ref(0)
  const progressPercentage = computed(() => {
    if (progressTotal.value === 0) return 0
    return Math.round((progressProcessed.value / progressTotal.value) * 100)
  })

  const targetIndexName = computed(() => {
    if (isRawImport.value) return selectedExistingIndex.value
    return importMode.value === 'new' ? newIndexName.value : selectedExistingIndex.value
  })

  const canStartImport = computed(() => {
    if (!selectedFile.value || !filePreview.value) return false
    if (isRawImport.value) return !!selectedExistingIndex.value

    if (importMode.value === 'new') return !!newIndexName.value
    if (importMode.value === 'existing') return !!selectedExistingIndex.value
    return false
  })

  
  watch(isRawImport, (val : any) => {
    if (val) {
      importMode.value = 'existing'
    } else {
      importMode.value = 'new'
    }
    selectedFile.value = null
    filePreview.value = null
  })
  
  const openImportDialog = async () => {
    importDialogVisible.value = true
    importError.value = ''
    importCompleted.value = false
    importErrors.value = []

    // Charger la liste des indices existants
    await loadExistingIndices()
  }

  const loadExistingIndices = async () => {
    try {
      const result = await callElasticsearch('catIndices', { h: 'index', index: '*' })
      existingIndices.value = Array.isArray(result) ? result.map((row: any) => row.index) : []
    } catch (error) {
      console.error('Error loading indices:', error)
      existingIndices.value = []
    }
  }

  const onFileSelected = async (file: File | null) => {
    if (!file) {
      filePreview.value = null
      return
    }

    try {
      if (isRawImport.value) {
        const content = await file.text()
        const lines = content.split('\n').filter(line => line.trim() !== '')
        if (lines.length === 0) {
          filePreview.value = { total: 0 }
          return
        }

        let docLines = lines
        let hasMapping = false
        try {
          const firstLine = JSON.parse(lines[0])
          if (firstLine.mappings || firstLine.settings) {
            docLines = lines.slice(1)
            hasMapping = true
          }
        } catch {
          // First line is not a mapping, assume all lines are documents
        }

        filePreview.value = {
          total: Math.floor(docLines.length / 2),
          hasMapping
        }
      } else {
        let content: string

        if (file.name.endsWith('.zip')) {
          // Décompresser le fichier ZIP
          const zip = new JSZip()
          const zipContent = await zip.loadAsync(file)
          const jsonFile = Object.keys(zipContent.files).find(name => name.endsWith('.json'))

          if (!jsonFile) {
            throw new Error(t('indices.import.error.no_json_in_zip'))
          }

          content = await zipContent.file(jsonFile)!.async('string')
        } else {
          // Fichier JSON direct
          content = await file.text()
        }

        const dumpData = JSON.parse(content)

        // Valider la structure du fichier
        if (!dumpData.index || !dumpData.documents || !Array.isArray(dumpData.documents)) {
          throw new Error(t('indices.import.error.invalid_file_format'))
        }

        filePreview.value = {
          index: dumpData.index,
          total: dumpData.total || dumpData.documents.length,
          hasMapping: !!dumpData.mapping,
          timestamp: dumpData.timestamp
        }

        // Suggérer un nom pour le nouvel index
        if (importMode.value === 'new') {
          newIndexName.value = `${dumpData.index}_imported_${new Date().toISOString().split('T')[0]}`
        }
      }
    } catch (error) {
      filePreview.value = null
      file = null
      console.error('Error parsing file:', error)
      importError.value = error instanceof Error ? error.message : t('indices.import.error.parse_failed')
      
      const requestState: RequestState = {
        loading: false,
        networkError: false,
        apiError: false,
        apiErrorMessage: 'Error parsing file:' + importError.value ,
        status: -1
      }

      showSnackbar(requestState)
    }
  }

  const startImport = async () => {
    if (!selectedFile.value || !filePreview.value) return

    importing.value = true
    importDialogVisible.value = false
    progressDialogVisible.value = true
    importError.value = ''
    importCompleted.value = false
    importErrors.value = []

    try {
      progressStatus.value = t('indices.import.progress.preparing')
      progressProcessed.value = 0
      progressTotal.value = 100

      const content = await selectedFile.value.text()
      const targetIndex = targetIndexName.value

      if (isRawImport.value) {
        const lines = content.split('\n').filter(line => line.trim() !== '')
        if (lines.length === 0) {
          importCompleted.value = true
          return
        }

        let bulkBodyLines = lines
        let mapping = null
        try {
          const firstLine = JSON.parse(lines[0])
          if (firstLine.mappings || firstLine.settings) {
            mapping = firstLine
            bulkBodyLines = lines.slice(1)
          }
        } catch { /* not a mapping */ }

        const exists = await callElasticsearch('indexExists', { index: targetIndex }) as unknown as boolean
        if (!exists && mapping) {
          await callElasticsearch('indexCreate', { index: targetIndex, body: mapping })
        }

        if (bulkBodyLines.length > 0) {
          let bulkBody = bulkBodyLines.join('\n')
          if (!bulkBody.endsWith('\n')) {
            bulkBody += '\n'
          }

          progressStatus.value = t('indices.import.progress.sending_bulk')
          progressTotal.value = Math.floor(bulkBodyLines.length / 2)
          
          // We use a generic 'bulk' call, assuming it exists and takes a raw body.
          // Progress reporting might not be supported for raw bulk.
          const result = await callElasticsearch('bulk', { body: bulkBody })

          if (result.errors) {
            importErrors.value = result.items
              .map((item: any) => (item.index || item.create || item.update || item.delete).error)
              .filter(Boolean)
            
            if (importErrors.value.length > 0) {
              throw new Error(t('indices.import.error.import_failed_with_errors'))
            }
          }
          progressProcessed.value = progressTotal.value
        }
      } else {
        const dumpData = JSON.parse(content)

        if (importMode.value === 'new') {
          await loadExistingIndices()
          if (existingIndices.value.includes(targetIndex)) {
            throw new Error(t('indices.import.error.index_exists', { index: targetIndex }))
          }
        }

        progressStatus.value = t('indices.import.progress.creating_index')

        const result = await callElasticsearch('indexRestore', {
          index: targetIndex,
          data: {
            mapping: dumpData.mapping,
            data: dumpData.documents
          },
          onProgress: (progress: { processed: number, total: number, percentage: number, status: string }) => {
            progressProcessed.value = progress.processed
            progressTotal.value = progress.total
            progressStatus.value = progress.status
          }
        })

        if (!result.success) {
          throw new Error(result.error || t('indices.import.error.import_failed'))
        }

        importErrors.value = result.errors || []
      }

      progressStatus.value = t('indices.import.progress.completed')
      importCompleted.value = true
      progressProcessed.value = progressTotal.value

    } catch (error) {
      console.error('Import error:', error)
      importError.value = error instanceof Error ? error.message : t('indices.import.error.unknown')
    } finally {
      importing.value = false
    }
  }

  const cancelImport = () => {
    // Note: L'import ne peut pas être annulé une fois commencé
    // On ferme juste le dialog

    isRawImport.value = false
    selectedFile.value = null

    closeProgressDialog()
  }

  const closeProgressDialog = () => {
    importDialogVisible.value = false
    progressDialogVisible.value = false
    if (importCompleted.value) {
      emit('done')
    }
  }

  return {
    importDialogVisible,
    progressDialogVisible,
    selectedFile,
    filePreview,
    isRawImport,
    importMode,
    newIndexName,
    selectedExistingIndex,
    overwriteExisting,
    fileInputAccept,
    fileInputLabel,
    existingIndices,
    importing,
    importCompleted,
    importError,
    importErrors,
    progressStatus,
    progressProcessed,
    progressTotal,
    progressPercentage,
    targetIndexName,
    canStartImport,
    openImportDialog,
    onFileSelected,
    startImport,
    cancelImport,
    closeProgressDialog,
    onMounted    
  }
}