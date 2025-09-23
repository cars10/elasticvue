<template>
  <q-btn id="import_index" color="primary-dark" :label="t('indices.import_index.heading')" @click="openImportDialog" />
<!-- 
  <q-item clickable @click="openImportDialog">
    <q-item-section side>
      <q-icon name="file_upload" size="xs" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ t('indices.index_row.options.import.text') }}</q-item-label>
    </q-item-section>
  </q-item> -->

  <!-- Dialog d'import -->
  <q-dialog v-model="importDialogVisible" persistent>
    <q-card style="min-width: 600px">
      <q-card-section>
        <div class="text-h6">{{ t('indices.import.title') }}</div>
        <div class="text-subtitle2">{{ t('indices.import.subtitle') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="startImport">
          <!-- Sélection du fichier -->
          <div class="q-mb-md">
            <q-file
              v-model="selectedFile"
              :label="t('indices.import.select_file')"
              accept=".json,.zip"
              filled
              @update:model-value="onFileSelected"
            >
              <template #prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
          </div>

          <!-- Options d'import -->
          <div class="q-mb-md">
            <q-radio 
              v-model="importMode" 
              val="new" 
              :label="t('indices.import.mode.new_index')" 
            />
            <q-radio 
              v-model="importMode" 
              val="existing" 
              :label="t('indices.import.mode.existing_index')" 
            />
          </div>

          <!-- Nom du nouvel index -->
          <div v-if="importMode === 'new'" class="q-mb-md">
            <q-input
              v-model="newIndexName"
              :label="t('indices.import.new_index_name')"
              filled
              :rules="[val => !!val || t('indices.import.validation.index_name_required')]"
            />
          </div>

          <!-- Sélection d'index existant -->
          <div v-if="importMode === 'existing'" class="q-mb-md">
            <q-select
              v-model="selectedExistingIndex"
              :options="existingIndices"
              :label="t('indices.import.select_existing_index')"
              filled
              :rules="[val => !!val || t('indices.import.validation.index_required')]"
            />
          </div>

          <!-- Options avancées -->
          <q-expansion-item
            :label="t('indices.import.advanced_options')"
            icon="settings"
            class="q-mb-md"
          >
            <div class="q-pa-md">
              <q-checkbox 
                v-model="overwriteExisting" 
                :label="t('indices.import.overwrite_existing')" 
              />
              <div class="text-caption text-grey-6 q-mt-sm">
                {{ t('indices.import.overwrite_warning') }}
              </div>
            </div>
          </q-expansion-item>

          <!-- Aperçu du fichier -->
          <div v-if="filePreview" class="q-mb-md">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle2">{{ t('indices.import.file_preview') }}</div>
                <div class="text-body2">
                  <div><strong>{{ t('indices.import.original_index') }}:</strong> {{ filePreview.index }}</div>
                  <div><strong>{{ t('indices.import.documents_count') }}:</strong> {{ filePreview.total }}</div>
                  <div><strong>{{ t('indices.import.has_mapping') }}:</strong> {{ filePreview.hasMapping ? t('common.yes') : t('common.no') }}</div>
                  <div><strong>{{ t('indices.import.export_date') }}:</strong> {{ new Date(filePreview.timestamp).toLocaleString() }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="t('defaults.cancel')" @click="importDialogVisible = false" />
        <q-btn 
          color="primary" 
          :label="t('indices.import.start_import')" 
          :loading="importing"
          :disable="!selectedFile || !canStartImport"
          @click="startImport" 
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Dialog de progression -->
  <q-dialog v-model="progressDialogVisible" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">{{ t('indices.import.progress.title') }}</div>
        <div class="text-subtitle2">{{ t('indices.import.progress.importing', { 
          targetIndex: targetIndexName 
        }) }}</div>
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

        <div v-if="importError" class="q-mt-md">
          <q-banner class="bg-negative text-white">
            <template #avatar>
              <q-icon name="error" />
            </template>
            {{ importError }}
          </q-banner>
        </div>

        <div v-if="importCompleted && importErrors.length > 0" class="q-mt-md">
          <q-banner class="bg-warning text-dark">
            <template #avatar>
              <q-icon name="warning" />
            </template>
            {{ t('indices.import.progress.completed_with_errors', { 
              errors: importErrors.length 
            }) }}
          </q-banner>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn 
          v-if="importCompleted || importError"
          flat 
          :label="t('defaults.close')" 
          @click="closeProgressDialog" 
        />
        <q-btn 
          v-else
          flat 
          color="negative" 
          :label="t('defaults.cancel')" 
          @click="cancelImport" 
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useTranslation } from '../../composables/i18n'
  import { useElasticsearchAdapter } from '../../composables/CallElasticsearch'
  import JSZip from 'jszip'

  const emit = defineEmits(['done'])

  const t = useTranslation()

  // État des dialogs
  const importDialogVisible = ref(false)
  const progressDialogVisible = ref(false)

  // Sélection de fichier
  const selectedFile = ref<File | null>(null)
  const filePreview = ref<any>(null)

  // Options d'import
  const importMode = ref<'new' | 'existing'>('new')
  const newIndexName = ref('')
  const selectedExistingIndex = ref('')
  const overwriteExisting = ref(false)

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
    return importMode.value === 'new' ? newIndexName.value : selectedExistingIndex.value
  })

  const canStartImport = computed(() => {
    if (!selectedFile.value || !filePreview.value) return false
    if (importMode.value === 'new') return !!newIndexName.value
    if (importMode.value === 'existing') return !!selectedExistingIndex.value
    return false
  })

  // Adapter Elasticsearch
  const { callElasticsearch } = useElasticsearchAdapter()

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

    } catch (error) {
      console.error('Error parsing file:', error)
      importError.value = error instanceof Error ? error.message : t('indices.import.error.parse_failed')
      filePreview.value = null
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

      // Lire le contenu du fichier
      let content: string
      if (selectedFile.value.name.endsWith('.zip')) {
        const zip = new JSZip()
        const zipContent = await zip.loadAsync(selectedFile.value)
        const jsonFile = Object.keys(zipContent.files).find(name => name.endsWith('.json'))!
        content = await zipContent.file(jsonFile)!.async('string')
      } else {
        content = await selectedFile.value.text()
      }

      const dumpData = JSON.parse(content)
      const targetIndex = targetIndexName.value

      // Collision si création d'un nouvel index portant un nom existant
      if (importMode.value === 'new') {
        await loadExistingIndices()
        if (existingIndices.value.includes(targetIndex)) {
          throw new Error(t('indices.import.error.index_exists', { index: targetIndex }))
        }
      }

      progressStatus.value = t('indices.import.progress.creating_index')
      
      // Restaurer l'index
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
    closeProgressDialog()
  }

  const closeProgressDialog = () => {
    progressDialogVisible.value = false
    if (importCompleted.value) {
      emit('done')
    }
  }

  onMounted(() => {
    // Reset form when dialog opens
    importDialogVisible.value = false
  })
</script>
