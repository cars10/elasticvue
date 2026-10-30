<template>
  <q-form @submit.prevent="sendRequest">
    <div class="row no-wrap items-center q-gutter-x-sm">
      <q-select
        v-model="tab.request.method"
        data-testid="rest-method"
        :options="HTTP_METHODS"
        :aria-label="t('query.rest.form.method.label')"
        options-dense
        dense
        outlined
        style="width: 120px"
      >
        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label :class="`http-${scope.opt}`" class="text-bold font-mono">{{ scope.opt }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template #selected-item="scope">
          <span :class="`http-${scope.opt}`" class="text-bold font-mono">{{ scope.opt }}</span>
        </template>
      </q-select>

      <rest-query-path-input
        v-model="tab.request.path"
        data-testid="rest-path"
        class="col"
        @paste="pasteClipboard"
        @submit="sendRequest"
        @select="useSuggestion"
      />

      <q-btn
        id="send_request"
        unelevated
        no-caps
        color="primary-dark"
        type="submit"
        icon-right="send"
        :loading="loading"
        :label="t('query.rest.form.send_request')"
      >
        <q-tooltip>{{ t('query.rest.form.send_hint') }}</q-tooltip>
      </q-btn>

      <q-btn
        flat
        round
        :icon="isSaved ? 'bookmark' : 'bookmark_border'"
        :color="isSaved ? 'primary' : undefined"
        :title="t('query.rest.form.save_request')"
        data-testid="rest-save"
      >
        <rest-query-name-prompt :initial-name="`${tab.request.method} ${tab.request.path}`" @save="saveQuery" />
      </q-btn>

      <q-btn
        flat
        round
        icon="content_paste"
        data-testid="rest-paste"
        :title="t('query.rest.form.paste_kibana')"
        @click="pasteClipboard"
      />

      <copy-button flat round :custom-handler="copyAsCurl" :title="t('search.form.copy_curl')" data-testid="rest-copy-curl" />
    </div>

    <resizable-container v-model="resizeStore.restForm" class="q-mt-md">
      <div class="row q-col-gutter-md full-height">
        <div class="col-6 column full-height">
          <div class="row no-wrap items-center justify-between q-mb-sm" style="height: 32px">
            <span class="text-weight-medium font-14 text-muted">{{ t('query.rest.form.request') }}</span>
            <span class="text-muted font-13">{{ t('query.rest.form.send_hint') }}</span>
          </div>

          <div
            v-if="noBody"
            class="col column flex-center text-center text-muted border-2 rounded-borders q-pa-md"
            data-testid="rest-no-body-hint"
          >
            <q-icon name="info" size="24px" class="q-mb-sm" />
            <div class="font-13">{{ t('query.rest.get_request_hint.no_body', { method: tab.request.method }) }}</div>
            <q-btn
              flat
              no-caps
              dense
              color="primary"
              class="q-mt-sm"
              :label="t('query.rest.get_request_hint.use_post')"
              @click="tab.request.method = 'POST'"
            />
          </div>

          <div v-else class="col full-width" data-testid="rest-request-body">
            <code-editor v-model="tab.request.body" :commands="editorCommands" :on-paste="onPaste" />
          </div>
        </div>

        <div class="col-6 column full-height">
          <div class="row no-wrap items-center q-mb-sm" style="height: 32px">
            <span class="col text-weight-medium font-14 text-muted">{{ t('query.rest.form.response') }}</span>
            <div v-if="tab.response.status" class="row no-wrap items-center font-13 tabular-nums q-mr-sm">
              <q-icon name="circle" size="8px" :color="statusColor" class="q-mr-xs" />
              <span :class="`text-${statusColor}`" class="text-weight-medium" data-testid="rest-response-status">
                {{ tab.response.status }}
              </span>
              <span v-if="tab.response.duration !== undefined" data-testid="rest-response-duration" class="text-muted q-ml-md"
                >{{ tab.response.duration }} ms</span
              >
              <span class="text-muted q-ml-md" data-testid="rest-response-size">{{ responseSize }}</span>
            </div>
            <download-button
              data-testid="rest-download"
              flat
              color="grey"
              label=""
              :title="t('query.rest.form.download_as_json')"
              :disable="tab.response.bodyText.length === 0"
              :download="downloadFileName"
              :generate-download-data="generateDownloadData"
            />
          </div>

          <div
            v-if="!tab.response.status && !tab.response.bodyText"
            class="col column flex-center text-muted border-2 rounded-borders q-pa-md"
          >
            <q-icon name="data_object" size="24px" class="q-mb-sm" />
            <div class="font-13">{{ t('query.rest.form.no_response') }}</div>
          </div>

          <div v-else class="col full-width" data-testid="rest-response-body">
            <code-viewer :value="tab.response.bodyText" />
          </div>
        </div>
      </div>
    </resizable-container>
  </q-form>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import ResizableContainer from '../shared/ResizableContainer.vue'
import DownloadButton from '../shared/DownloadButton.vue'
import CopyButton from '../shared/CopyButton.vue'
import RestQueryPathInput from './RestQueryPathInput.vue'
import RestQueryNamePrompt from './RestQueryNamePrompt.vue'
import { useRestQueryForm } from '../../composables/components/rest/RestQueryForm.ts'
import { HTTP_METHODS } from '../../consts'
import { useResizeStore } from '../../store/resize'
import { useRestStore } from '../../store/rest.ts'
import { useTranslation } from '../../composables/i18n'
import { readFromClipboard, writeToClipboard } from '../../helpers/clipboard.ts'
import { curlCommand, pickRequest, restRequestUrl, type RestPathSuggestion } from '../../helpers/rest.ts'
import { useConnectionStore } from '../../store/connection.ts'

const CodeViewer = defineAsyncComponent(() => import('../shared/CodeViewer.vue'))
const CodeEditor = defineAsyncComponent(() => import('../shared/CodeEditor.vue'))

const props = defineProps<{ tabId: number }>()

const t = useTranslation()
const resizeStore = useResizeStore()
const tab = useRestStore().tabs.find((tab) => tab.id === props.tabId)!

const {
  loading,
  sendRequest,
  statusColor,
  responseSize,
  noBody,
  isSaved,
  saveQuery,
  editorCommands,
  generateDownloadData,
  downloadFileName,
  onPaste
} = useRestQueryForm(tab)

const pasteClipboard = async () => onPaste(await readFromClipboard())
const copyAsCurl = () => {
  const { method, path, body } = tab.request
  const url = restRequestUrl(useConnectionStore().activeCluster?.uri || '', path)
  writeToClipboard(curlCommand(method, url, noBody.value ? '' : body))
}
const useSuggestion = (suggestion: RestPathSuggestion) => Object.assign(tab.request, pickRequest(suggestion))
</script>
