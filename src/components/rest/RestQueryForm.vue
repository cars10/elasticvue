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
               autofocus />
    </div>

    <resizable-container v-model="resizeStore.restForm" class="q-mb-md">
      <div class="row q-my-md full-height">
        <div class="col-6 q-pr-sm full-height">
          <code-editor v-model="ownRequest.body" />
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
        <q-chip v-if="response.status" :label="response.status" :class="responseStatusClass" />

        <br>
        <q-btn size="12px" flat class="q-mt-md" :label="$t('query.rest.form.reset')" @click="resetRequest" />
      </div>
      <div class="col-6 text-right">
        <download-button color="visible-bg"
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
  import { useIdb } from '../../composables/Idb'

  const props = defineProps({
    tab: {
      type: Object,
      default: () => {
      }
    }
  })
  const emit = defineEmits(['updateTab', 'reloadHistory'])

  const db = useIdb()
  const ownRequest = ref(props.tab.request)
  watch(ownRequest.value, value => {
    const obj = Object.assign({}, toRaw(props.tab), { request: toRaw(value) })
    db.stores.restQueryTabs.update(obj)
  })

  const resizeStore = useResizeStore()
  const {
    loading,
    response,
    sendRequest,
    responseStatusClass,
    resetRequest
  } = useRestQuery(ownRequest.value, emit)

  const generateDownloadData = () => (response.value.bodyText)
  const downloadFileName = computed(() => {
    return `${ownRequest.value.method.toLowerCase()}_${ownRequest.value.path.replace(/[\W_]+/g, '_')}.json`
  })
</script>
