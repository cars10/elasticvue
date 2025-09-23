<template>
  <q-item clickable @click="openExportDialog">
    <q-item-section side>
      <q-icon name="file_download" size="xs" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ t('indices.index_row.options.export.text') }}</q-item-label>
    </q-item-section>
  </q-item>

  <!-- Dialog d'export -->
  <q-dialog v-model="exportDialogVisible" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">{{ t('indices.export.title', { index: index }) }}</div>
        <div class="text-subtitle2">{{ t('indices.export.subtitle') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="startExport">
          <div class="q-mb-md">
            <q-checkbox 
              v-model="includeMapping" 
              :label="t('indices.export.include_mapping')" 
            />
          </div>
          
          <div class="q-mb-md">
            <q-checkbox 
              v-model="compressFile" 
              :label="t('indices.export.compress_file')" 
            />
          </div>

          <div class="text-caption text-grey-6">
            {{ t('indices.export.warning') }}
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="t('defaults.cancel')" @click="exportDialogVisible = false" />
        <q-btn 
          color="primary" 
          :label="t('indices.export.start_export')" 
          :loading="exporting"
          @click="startExport" 
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Dialog de progression -->
  <q-dialog v-model="progressDialogVisible" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">{{ t('indices.export.progress.title') }}</div>
        <div class="text-subtitle2">{{ t('indices.export.progress.exporting', { index }) }}</div>
      </q-card-section>

      <q-card-section>
        <div class="q-mb-md">
          <div class="text-body2 q-mb-sm">{{ progressStatus }}</div>
          <q-linear-progress 
            :value="progressPercentage / 100" 
            color="primary" 
            size="20px"
            rounded
          />
          <div class="text-caption text-center q-mt-sm">
            {{ progressProcessed }} / {{ progressTotal }} ({{ progressPercentage }}%)
          </div>
        </div>

        <div v-if="exportError" class="q-mt-md">
          <q-banner class="bg-negative text-white">
            <template #avatar>
              <q-icon name="error" />
            </template>
            {{ exportError }}
          </q-banner>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn 
          v-if="exportCompleted || exportError"
          flat 
          :label="t('defaults.close')" 
          @click="closeProgressDialog" 
        />
        <q-btn 
          v-else
          flat 
          color="negative" 
          :label="t('defaults.cancel')" 
          @click="cancelExport" 
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useTranslation } from '../../composables/i18n'
  import { useElasticsearchAdapter } from '../../composables/CallElasticsearch'
  import JSZip from 'jszip'

  const props = defineProps<{
    index: string
  }>()

  const emit = defineEmits(['done'])

  const t = useTranslation()

  // État des dialogs
  const exportDialogVisible = ref(false)
  const progressDialogVisible = ref(false)

  // Options d'export
  const includeMapping = ref(true)
  const compressFile = ref(true)

  // État de l'export
  const exporting = ref(false)
  const exportCompleted = ref(false)
  const exportError = ref('')
  const progressStatus = ref('')
  const progressProcessed = ref(0)
  const progressTotal = ref(0)
  const progressPercentage = computed(() => {
    if (progressTotal.value === 0) return 0
    return Math.round((progressProcessed.value / progressTotal.value) * 100)
  })

  // Adapter Elasticsearch
  const { callElasticsearch } = useElasticsearchAdapter()

  const openExportDialog = () => {
    exportDialogVisible.value = true
    exportError.value = ''
    exportCompleted.value = false
  }

  const startExport = async () => {
    exporting.value = true
    exportDialogVisible.value = false
    progressDialogVisible.value = true
    exportError.value = ''
    exportCompleted.value = false
    
    try {
      progressStatus.value = t('indices.export.progress.preparing')
      progressProcessed.value = 0
      progressTotal.value = 100

      // Récupérer les données de l'index
      const result = await callElasticsearch('indexDump', {
        index: props.index,
        onProgress: (progress: { processed: number, total: number, percentage: number }) => {
          progressProcessed.value = progress.processed
          progressTotal.value = progress.total
          progressStatus.value = t('indices.export.progress.exporting_documents', {
            processed: progress.processed,
            total: progress.total
          })
        }
      })

      if (!result.success) {
        throw new Error(result.error || t('indices.export.error.export_failed'))
      }

      progressStatus.value = t('indices.export.progress.creating_file')
      
      // Créer le fichier de dump
      const dumpData = {
        index: props.index,
        timestamp: new Date().toISOString(),
        version: '1.0',
        mapping: includeMapping.value ? result.mapping : null,
        documents: result.data,
        total: result.total
      }

      let fileContent: string | Blob
      let fileName: string
      let mimeType: string

      if (compressFile.value) {
        // Créer un fichier ZIP
        const zip = new JSZip()
        zip.file('index_dump.json', JSON.stringify(dumpData, null, 2))
        
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        fileContent = zipBlob
        fileName = `${props.index}_dump_${new Date().toISOString().split('T')[0]}.zip`
        mimeType = 'application/zip'
      } else {
        // Fichier JSON simple
        fileContent = JSON.stringify(dumpData, null, 2)
        fileName = `${props.index}_dump_${new Date().toISOString().split('T')[0]}.json`
        mimeType = 'application/json'
      }

      progressStatus.value = t('indices.export.progress.downloading')
      
      // Télécharger le fichier
      const blob = typeof fileContent === 'string' 
        ? new Blob([fileContent], { type: mimeType })
        : fileContent
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      progressStatus.value = t('indices.export.progress.completed')
      exportCompleted.value = true
      progressProcessed.value = progressTotal.value

    } catch (error) {
      console.error('Export error:', error)
      exportError.value = error instanceof Error ? error.message : t('indices.export.error.unknown')
    } finally {
      exporting.value = false
    }
  }

  const cancelExport = () => {
    // Note: L'export ne peut pas être annulé une fois commencé
    // On ferme juste le dialog
    closeProgressDialog()
  }

  const closeProgressDialog = () => {
    progressDialogVisible.value = false
    if (exportCompleted.value) {
      emit('done')
    }
  }
</script>
