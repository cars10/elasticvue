<template>
  <div class="row">
    <div class="col-lg-2 col-sm-3 q-pr-sm">
      <q-select v-model="request.method"
                :options="HTTP_METHODS"
                options-dense
                :label="$t('query.rest.form.method.label')" />
    </div>
    <div class="col-lg-10 col-sm-9 q-pl-sm">
      <q-input v-model="request.path"
               :label="$t('query.rest.form.path.label')"
               autofocus />
    </div>
  </div>

  <resizable-container v-model="resizeStore.restForm" class="q-mb-md">
    <div class="row q-my-md full-height">
      <div class="col-6 q-pr-sm full-height">
        <code-editor v-model="request.body" />
      </div>
      <div class="col-6 q-pl-sm">
        <code-viewer :value="response.body" />
      </div>
    </div>
  </resizable-container>

  <div class="row">
    <div class="col-6">
      <q-btn :loading="loading" color="primary-dark" type="submit" :label="$t('query.rest.form.send_request')" />
      <q-chip v-if="response.status" :label="response.status" />

      <br>
      <q-btn dense flat class="q-mt-md" :label="$t('query.rest.form.reset')" @click="reset" />
    </div>
  </div>
</template>

<script setup>
  import { HTTP_METHODS } from '../../consts'
  import { ref } from 'vue'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import { useResizeStore } from '../../store/resize'
  import CodeViewer from '../shared/CodeViewer.vue'
  import CodeEditor from '../shared/CodeEditor.vue'

  const resizeStore = useResizeStore()
  const request = ref({})
  const response = ref({})

  const loading = ref(false)
  const reset = () => {
  }
</script>