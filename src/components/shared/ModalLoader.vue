<template>
  <q-dialog v-model="ownValue" transition-show="none">
    <q-card style="width: 1000px; max-width: 80vw;">
      <q-card-section class="flex justify-between">
        <div class="flex">
          <h2 class="text-h6 q-my-none">
            {{ store.method }}
          </h2>
          <reload-button :action="load" />
        </div>

        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <p>
          {{ store.methodParams }}
        </p>

        <loader-status :request-state="requestState">
          <resizable-container v-model="resizeStore.modalLoaderCodeViewer">
            <code-viewer :value="data" />
          </resizable-container>
        </loader-status>
      </q-card-section>

      <q-card-section>
        <q-btn v-close-popup flat :label="t('defaults.close')" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref, watch } from 'vue'
  import { useModalStore } from '../../store/modal'
  import LoaderStatus from './LoaderStatus.vue'
  import { useElasticsearchAdapter } from '../../composables/CallElasticsearch'
  import CodeViewer from './CodeViewer.vue'
  import ReloadButton from './ReloadButton.vue'
  import ResizableContainer from './ResizableContainer.vue'
  import { useResizeStore } from '../../store/resize'
  import { stringifyBigInt } from '../../services/json/stringify'
  import { useTranslation } from '../../composables/i18n'

  const t = useTranslation()
  const resizeStore = useResizeStore()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()

  const data = ref(null)
  const load = () => {
    callElasticsearch(store.method, store.methodParams)
        .then(body => (data.value = stringifyBigInt(body)))
        .catch(() => (data.value = null))
  }

  const store = useModalStore()
  const ownValue = ref(false)

  watch(() => store.show, newValue => (ownValue.value = newValue))
  watch(() => ownValue.value, newValue => {
    load()
    store.setShow(newValue)
  })
</script>
