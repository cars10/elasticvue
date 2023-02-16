<template>
  <q-form @submit.prevent="sendRequest">
    <div class="row">
      <div class="col-lg-2 col-sm-3 q-pr-sm">
        <q-select v-model="requestStore.request.method"
                  :options="HTTP_METHODS"
                  options-dense
                  :label="$t('query.rest.form.method.label')" />
      </div>
      <div class="col-lg-10 col-sm-9 q-pl-sm">
        <q-input v-model="requestStore.request.path"
                 :label="$t('query.rest.form.path.label')"
                 autofocus />
      </div>
    </div>

    <resizable-container v-model="resizeStore.restForm" class="q-mb-md">
      <div class="row q-my-md full-height">
        <div class="col-6 q-pr-sm full-height">
          <code-editor v-model="requestStore.request.body" />
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
  import { computed } from 'vue'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import DownloadButton from '../shared/DownloadButton.vue'
  import CodeViewer from '../shared/CodeViewer.vue'
  import CodeEditor from '../shared/CodeEditor.vue'
  import { useRestQuery } from '../../composables/RestQuery'
  import { HTTP_METHODS } from '../../consts'
  import { useResizeStore } from '../../store/resize'
  import { useRestQueryStore } from '../../store/rest_query'

  const resizeStore = useResizeStore()
  const generateDownloadData = () => (response.value.bodyText)
  const { loading, response, sendRequest, responseStatusClass, resetRequest } = useRestQuery()
  const requestStore = useRestQueryStore()

  const downloadFileName = computed(() => {
    return `${requestStore.request.method.toLowerCase()}_${requestStore.request.path.replace(/[\W_]+/g, '_')}.json`
  })
</script>