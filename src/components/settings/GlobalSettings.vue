<template>
  <div class="row">
    <div class="col-12 col-lg-10 col-xl-8">
      <div class="q-mb-lg">
        <h1 class="page-title">{{ t('settings.heading') }}</h1>
      </div>

      <settings-section :title="t('settings.editor.heading')">
        <settings-row tag="label" :label="t('settings.editor_vim_mode.label')">
          <q-toggle
            v-model="codeEditorStore.vimMode"
            :aria-label="t('settings.editor_vim_mode.label')"
            data-testid="settings-vim-mode"
          />
        </settings-row>
        <settings-row tag="label" :label="t('settings.editor.wrap_lines')">
          <q-toggle
            v-model="codeEditorStore.wrapLines"
            :aria-label="t('settings.editor.wrap_lines')"
            data-testid="settings-wrap-lines"
          />
        </settings-row>
      </settings-section>

      <settings-section
        :title="t('settings.cluster.heading', { name: clusterName })"
        :description="t('settings.cluster.message')"
      >
        <settings-row :label="t('settings.hide_indices_regex.label')" :description="t('settings.hide_indices_regex.message')">
          <custom-input v-model="indicesStore.hideIndicesRegex" outlined dense class="full-width">
            <template #append>
              <q-btn
                icon="settings_backup_restore"
                flat
                round
                dense
                size="sm"
                :title="t('settings.hide_indices_regex.reset', { regex: DEFAULT_HIDE_INDICES_REGEX })"
                @click="resetHideIndicesRegex"
              />
            </template>
          </custom-input>
        </settings-row>

        <settings-row
          :label="t('settings.hide_nodes_attributes_regex.label')"
          :description="t('settings.hide_nodes_attributes_regex.message')"
        >
          <custom-input v-model="nodesStore.hideAttributesRegex" outlined dense class="full-width">
            <template #append>
              <q-btn
                icon="settings_backup_restore"
                flat
                round
                dense
                size="sm"
                :title="t('settings.hide_nodes_attributes_regex.reset', { regex: DEFAULT_HIDE_NODE_ATTRIBUTES_REGEX })"
                @click="resetHideNodesAttributesRegex"
              />
            </template>
          </custom-input>
        </settings-row>

        <settings-row
          :label="t('settings.document_field_max_length.label')"
          :description="t('settings.document_field_max_length.message')"
        >
          <custom-input
            v-model="searchStore.documentFieldMaxLength"
            outlined
            dense
            type="number"
            class="full-width"
            :rules="[(val) => (/^\d+$/.test(val) && val >= 1 && val <= 1000) || t('settings.document_field_max_length.invalid')]"
          >
            <template #append>
              <q-btn
                icon="settings_backup_restore"
                flat
                round
                dense
                size="sm"
                :title="t('settings.document_field_max_length.reset', { value: DEFAULT_DOCUMENT_FIELD_MAX_LENGTH })"
                @click="resetDocumentFieldMaxLength"
              />
            </template>
          </custom-input>
        </settings-row>

        <settings-row tag="label" :label="t('settings.localize_timestamp.label')">
          <q-toggle
            v-model="searchStore.localizeTimestamp"
            :aria-label="t('settings.localize_timestamp.label')"
            data-testid="settings-localize-timestamp"
          />
        </settings-row>
      </settings-section>

      <import-export />

      <settings-section :title="t('settings.disconnect_and_reset.heading')">
        <settings-row :label="t('settings.disconnect_and_reset.message')">
          <q-btn outline color="negative" :label="t('settings.disconnect_and_reset.button')" @click="reset" />
        </settings-row>
      </settings-section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIndicesStore } from '../../store/indices'
import { DEFAULT_HIDE_INDICES_REGEX, DEFAULT_HIDE_NODE_ATTRIBUTES_REGEX, DEFAULT_DOCUMENT_FIELD_MAX_LENGTH } from '../../consts'
import { askConfirm } from '../../helpers/dialogs'
import { useTranslation } from '../../composables/i18n'
import ImportExport from './ImportExport.vue'
import SettingsSection from './SettingsSection.vue'
import SettingsRow from './SettingsRow.vue'
import CustomInput from '../shared/CustomInput.vue'
import { useSearchStore } from '../../store/search.ts'
import { useNodesStore } from '../../store/nodes.ts'
import { useCodeEditorStore } from '../../store/codeEditor.ts'
import { useConnectionStore } from '../../store/connection.ts'

const t = useTranslation()
const indicesStore = useIndicesStore()
const nodesStore = useNodesStore()
const searchStore = useSearchStore()
const codeEditorStore = useCodeEditorStore()

const clusterName = computed(() => useConnectionStore().activeCluster?.name || '')

const resetHideIndicesRegex = () => (indicesStore.hideIndicesRegex = DEFAULT_HIDE_INDICES_REGEX)
const resetHideNodesAttributesRegex = () => (nodesStore.hideAttributesRegex = DEFAULT_HIDE_NODE_ATTRIBUTES_REGEX)
const resetDocumentFieldMaxLength = () => (searchStore.documentFieldMaxLength = DEFAULT_DOCUMENT_FIELD_MAX_LENGTH)

const reset = async () => {
  const confirmed = await askConfirm(t('settings.disconnect_and_reset.confirm'))
  if (!confirmed) return

  window.indexedDB.databases().then((databases) => {
    databases.forEach((db) => {
      if (db?.name) window.indexedDB.deleteDatabase(db.name)
    })
  })

  localStorage.clear()
  window.location.reload()
}
</script>
