<template>
  <q-form @submit.prevent="sendRequest">
    <div class="flex">
      <q-select v-model="ownRequest.method"
                :options="HTTP_METHODS"
                options-dense
                style="width: 120px"
                class="q-mr-md"
                :label="$t('query.rest.form.method.label')" />
      <q-input v-model="ownRequest.path"
               :label="$t('query.rest.form.path.label')"
               class="col-grow"
               autofocus
               @keydown.enter.prevent="sendRequest" />
      <q-btn icon="send" flat type="submit" />
    </div>

    <resizable-container v-model="resizeStore.restForm" class="q-mb-md">
      <div class="row q-my-md full-height">
        <div class="col-6 q-pr-sm full-height">
          <q-banner v-show="['GET', 'HEAD'].includes(ownRequest.method)" class="bg-default q-pa-md">
            <template #avatar>
              <q-icon name="info" />
            </template>
            <p>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <span v-html="$t('query.rest.get_request_hint.cannot_send_body', { method: ownRequest.method })" />
              <button class="btn-link" type="button" @click=" ownRequest.method = 'POST'">
                {{ $t('query.rest.get_request_hint.use_post') }}
              </button>
              {{ $t('query.rest.get_request_hint.query_parameters') }}
            </p>
            <p class="q-mb-none">{{ $t('query.rest.get_request_hint.search_post') }}</p>
          </q-banner>

          <code-editor v-show="!['GET', 'HEAD'].includes(ownRequest.method)"
                       v-model="ownRequest.body"
                       :commands="editorCommands" />
        </div>
        <div class="col-6 q-pl-sm">
          <code-viewer :value="response.bodyText" />
        </div>
      </div>
    </resizable-container>

    <div class="row">
      <div class="col-6">
        <q-btn class="q-mr-sm" :loading="loading" color="primary-dark" type="submit"
               :label="$t('query.rest.form.send_request')" />

        <q-btn :label="$t('query.rest.form.save_request')" icon="save" color="dark-grey q-mr-sm" @click="saveQuery" />

        <q-chip v-if="response.status" :label="response.status" :class="responseStatusClass" />
      </div>
      <div class="col-6 text-right">
        <download-button color="dark-grey"
                         :disable="response.bodyText.length === 0"
                         size="12px"
                         class="q-mb-md"
                         :download="downloadFileName"
                         :label="$t('query.rest.form.download_as_json')"
                         :generate-download-data="generateDownloadData" />
      </div>
    </div>
  </q-form>
</template>

<script setup>
  import { computed, ref, toRaw, watch } from 'vue'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import DownloadButton from '../shared/DownloadButton.vue'
  import CodeViewer from '../shared/CodeViewer.vue'
  import CodeEditor from '../shared/CodeEditor.vue'
  import { useRestQuery } from '../../composables/RestQuery'
  import { HTTP_METHODS } from '../../consts'
  import { useResizeStore } from '../../store/resize'
  import { useIdbStore } from '../../composables/Idb'
  import { debounce } from '../../helpers/debounce'

  const props = defineProps({
    tab: {
      type: Object,
      default: () => {
      }
    }
  })
  const emit = defineEmits(['updateTab', 'reloadHistory', 'reloadSavedQueries'])

  const { restQueryTabs, restQuerySavedQueries } = useIdbStore(['restQueryTabs', 'restQuerySavedQueries'])

  const saveQuery = () => {
    const { method, path, body } = toRaw(ownRequest.value)
    restQuerySavedQueries.insert({ method, path, body }).then(() => {
      emit('reloadSavedQueries')
    })
  }

  const ownRequest = ref(props.tab.request)
  watch(ownRequest.value, value => (updateTab(value)))
  const updateTab = debounce((value) => {
    const obj = Object.assign({}, toRaw(props.tab), { request: toRaw(value) })
    restQueryTabs.update(obj)
  }, 200)

  const resizeStore = useResizeStore()
  const { loading, response, sendRequest, responseStatusClass } = useRestQuery(ownRequest.value, emit)

  const editorCommands = [{
    bindKey: { win: 'Ctrl+ENTER', mac: 'Command+ENTER', linux: 'Ctrl+ENTER' },
    exec: sendRequest
  }]

  const generateDownloadData = () => (response.value.bodyText)
  const downloadFileName = computed(() => {
    return `${ownRequest.value.method.toLowerCase()}_${ownRequest.value.path.replace(/[\W_]+/g, '_')}.json`
  })
</script>
