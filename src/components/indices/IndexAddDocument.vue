<template>
  <q-btn
    flat
    round
    dense
    icon="note_add"
    :title="t('indices.index_add_document.text')"
    data-testid="index-add-document"
    @click="dialog = true"
  />

  <q-dialog v-model="dialog" transition-duration="100" @show="reset">
    <q-card style="width: 1000px; max-width: 80vw">
      <q-card-section class="flex justify-between">
        <h2 class="text-h6 q-my-none">{{ t('indices.index_add_document.heading', { index }) }}</h2>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-md q-mb-md">
          <custom-input
            v-model="id"
            class="col"
            :label="t('indices.index_add_document.id')"
            outlined
            dense
            data-testid="index-add-document-id"
          />
          <custom-input
            v-if="!clusterVersionGte(7)"
            v-model="type"
            class="col"
            :label="t('indices.index_add_document.type')"
            outlined
            dense
          />
        </div>
        <q-btn-toggle
          :model-value="mode"
          :options="modeOptions"
          no-caps
          unelevated
          toggle-color="primary-dark"
          color="dark-grey"
          class="q-mb-md"
          data-testid="index-add-document-mode"
          @update:model-value="setMode"
        />

        <template v-if="mode === 'fields'">
          <q-spinner v-if="loadingFields" size="24px" />
          <div v-else-if="!inputs.length" class="text-muted" data-testid="index-add-document-no-fields">
            {{ t('indices.index_add_document.no_fields') }}
          </div>
          <q-markup-table v-else flat dense data-testid="index-add-document-fields">
            <tbody>
              <tr v-for="input in inputs" :key="input.name">
                <td class="text-no-wrap" style="width: 1%">
                  <div class="font-mono">{{ input.name }}</div>
                  <div class="text-muted font-13">{{ input.type }}</div>
                </td>
                <td>
                  <q-select
                    v-if="input.kind === 'boolean'"
                    v-model="values[input.name]"
                    :options="[true, false]"
                    clearable
                    outlined
                    dense
                    :data-testid="`index-add-document-field-${input.name}`"
                  />
                  <custom-input
                    v-else
                    v-model="values[input.name]"
                    :type="INPUT_TYPES[input.kind]"
                    :step="input.kind === 'number' ? 'any' : undefined"
                    :placeholder="input.kind === 'json' ? t('indices.index_add_document.json_placeholder') : undefined"
                    :input-class="input.kind === 'json' ? 'font-mono' : undefined"
                    outlined
                    dense
                    :data-testid="`index-add-document-field-${input.name}`"
                  />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </template>

        <resizable-container v-else v-model="resizeStore.documentEdit">
          <div class="full-height" data-testid="index-add-document-json">
            <code-editor v-model="document" />
          </div>
        </resizable-container>
      </q-card-section>

      <q-card-section>
        <q-btn
          :label="t('indices.index_add_document.submit')"
          :loading="loading"
          :disable="!type"
          color="positive"
          class="q-mr-md"
          data-testid="index-add-document-submit"
          @click="addDocument"
        />
        <q-btn v-close-popup flat :label="t('defaults.close')" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import CustomInput from '../shared/CustomInput.vue'
import ResizableContainer from '../shared/ResizableContainer.vue'
import { useTranslation } from '../../composables/i18n'
import { useResizeStore } from '../../store/resize.ts'
import { defineElasticsearchRequest } from '../../composables/CallElasticsearch.ts'
import { clusterVersionGte } from '../../helpers/minClusterVersion.ts'
import { useFieldCatalog } from '../../composables/components/search/FieldCatalog.ts'
import { buildDocument, documentInputs } from '../../helpers/newDocument.ts'
import { stringifyJson } from '../../helpers/json/stringify.ts'

const CodeEditor = defineAsyncComponent(() => import('../shared/CodeEditor.vue'))

const props = defineProps<{ index: string }>()
const emit = defineEmits(['reload'])
const t = useTranslation()
const resizeStore = useResizeStore()

const INPUT_TYPES = { text: 'text', number: 'number', boolean: 'text', date: 'datetime-local', json: 'text' } as const

const dialog = ref(false)
const id = ref('')
const type = ref('_doc')
const document = ref('')
const mode = ref<'fields' | 'json'>('fields')
const values = ref<Record<string, any>>({})
const loadingFields = ref(false)
const modeOptions = [
  { label: t('indices.index_add_document.modes.fields'), value: 'fields' },
  { label: 'JSON', value: 'json' }
]

const { catalog, load } = useFieldCatalog()
const inputs = computed(() => documentInputs(catalog.value))
const fieldsDocument = () => stringifyJson(buildDocument(inputs.value, values.value), null, 2)

const reset = async () => {
  mode.value = 'fields'
  values.value = {}
  document.value = '{\n  \n}'
  loadingFields.value = true
  await load([props.index], { force: true })
  loadingFields.value = false
}

const setMode = (value: 'fields' | 'json') => {
  if (value === 'json') document.value = fieldsDocument()
  mode.value = value
}

const { run, loading } = defineElasticsearchRequest({ method: 'indexDocument' })
const addDocument = async () => {
  const added = await run({
    params: {
      index: props.index,
      type: type.value,
      id: id.value,
      params: mode.value === 'fields' ? fieldsDocument() : document.value
    },
    snackbarOptions: { body: t('indices.index_add_document.growl') }
  })
  if (!added) return
  dialog.value = false
  id.value = ''
  emit('reload')
}
</script>
