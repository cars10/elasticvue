<template>
  <q-form @submit.prevent="sendRequest">
    <div class="q-mb-md">
      <q-btn :label="t('query.rest.form.paste_kibana')"
             flat
             size="md"
             no-caps
             class="btn-link q-py-none q-px-sm"
             @click="pasteClipboard" />
    </div>

    <div class="flex">
      <q-select v-model="ownTab.request.method"
                :options="HTTP_METHODS"
                options-dense
                style="width: 140px"
                outlined
                class="q-mr-md"
                :label="t('query.rest.form.method.label')">
        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label :class="`http-${scope.opt}`" class="text-bold">
                {{ scope.opt }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template #selected-item="scope">
          <span :class="`http-${scope.opt}`" class="text-bold">{{ scope.opt }}</span>
        </template>
      </q-select>
      <q-input v-model="ownTab.request.path"
               name="path"
               :label="t('query.rest.form.path.label')"
               class="col-grow"
               outlined
               autofocus
               @keydown.enter.prevent="sendRequest" />
      <q-btn id="send_request" icon="send" flat type="submit" />
    </div>

    <resizable-container v-model="resizeStore.restForm" class="q-mb-md">
      <div class="row q-my-md full-height">
        <div class="col-6 q-pr-sm full-height">
          <q-banner v-show="['GET', 'HEAD'].includes(ownTab.request.method)" class="bg-dark-grey q-pa-md">
            <template #avatar>
              <q-icon name="info" />
            </template>
            <p>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <span v-html="t('query.rest.get_request_hint.cannot_send_body', { method: ownTab.request.method })" />
              <button class="btn-link q-pa-none" type="button" @click=" ownTab.request.method = 'POST'">
                {{ t('query.rest.get_request_hint.use_post') }}
              </button>
              {{ t('query.rest.get_request_hint.query_parameters') }}
            </p>
            <p class="q-mb-none">{{ t('query.rest.get_request_hint.search_post') }}</p>
          </q-banner>

          <code-editor v-show="!['GET', 'HEAD'].includes(ownTab.request.method)"
                       v-model="ownTab.request.body"
                       :commands="editorCommands"
                       :on-paste="onPaste" />
        </div>
        <div class="col-6 q-pl-sm full-height">
          <code-viewer :value="ownTab.response.bodyText" />
        </div>
      </div>
    </resizable-container>

    <div class="row">
      <div class="col-6">
        <q-btn class="q-mr-sm" :loading="loading" color="primary-dark" type="submit"
               :label="t('query.rest.form.send_request')" />

        <q-btn :label="t('query.rest.form.save_request')" icon="save" color="dark-grey q-mr-sm" @click="saveQuery" />

        <q-chip v-if="ownTab.response.status" :label="ownTab.response.status" :class="responseStatusClass" />
      </div>
      <div class="col-6 text-right">
        <download-button color="dark-grey"
                         :disable="ownTab.response.bodyText.length === 0"
                         size="12px"
                         class="q-mb-md"
                         :download="downloadFileName"
                         :label="t('query.rest.form.download_as_json')"
                         :generate-download-data="generateDownloadData" />
      </div>
    </div>
  </q-form>
</template>

<script setup lang="ts">
  import { defineAsyncComponent } from 'vue'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import DownloadButton from '../shared/DownloadButton.vue'
  import { useRestQueryForm } from '../../composables/components/rest/RestQueryForm.ts'
  import { HTTP_METHODS } from '../../consts'
  import { useResizeStore } from '../../store/resize'
  import { useTranslation } from '../../composables/i18n'
  import { IdbRestQueryTab } from '../../db/types.ts'

  const CodeViewer = defineAsyncComponent(() => import('../shared/CodeViewer.vue'))
  const CodeEditor = defineAsyncComponent(() => import('../shared/CodeEditor.vue'))

  const t = useTranslation()
  const props = defineProps<{ tab: IdbRestQueryTab }>()
  const emit = defineEmits(['reloadHistory', 'reloadSavedQueries'])
  const pasteClipboard = async () => {
    const text = await navigator.clipboard.readText()
    onPaste(text)
  }

  const resizeStore = useResizeStore()
  const {
    saveQuery,
    ownTab,
    editorCommands,
    generateDownloadData,
    downloadFileName,
    loading,
    sendRequest,
    responseStatusClass,
    onPaste
  } = useRestQueryForm(props, emit)
</script>
