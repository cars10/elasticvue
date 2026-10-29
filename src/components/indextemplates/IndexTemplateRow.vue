<template>
  <tr class="clickable" @click="toggle">
    <td>
      <q-icon :name="expand ? 'expand_less' : 'expand_more'" />
    </td>
    <td :title="row.name">
      <span class="text-weight-medium">{{ row.name }}</span>
      <q-badge v-if="row.managed" outline color="grey" label="managed" class="q-ml-sm" />
      <q-badge v-if="row.dataStream" outline color="primary" label="data stream" class="q-ml-sm" />
    </td>
    <td>
      <q-badge outline :color="TYPE_COLORS[row.type]" :label="row.type" />
    </td>
    <td :title="row.indexPatterns.join('\n')">{{ row.indexPatterns.join(', ') }}</td>
    <td class="text-right">{{ row.priority ?? '' }}</td>
    <td>
      <div v-if="row.composedOf.length" class="row no-wrap">
        <q-badge
          v-for="name in row.composedOf"
          :key="name"
          outline
          color="primary"
          class="cursor-pointer q-mr-xs"
          :label="name"
          @click.stop="emit('show-template', name)"
        />
      </div>
      <span v-else-if="row.type === 'component'" :class="row.usedBy.length ? 'text-muted' : 'health--yellow'" class="font-13">
        {{ t('index_templates.index_template_row.used_by', { count: row.usedBy.length }, row.usedBy.length) }}
      </span>
    </td>
  </tr>

  <tr v-if="expand">
    <td colspan="100%">
      <div class="q-pa-md">
        <loader-status :request-state="requestState">
          <resizable-container v-if="body">
            <code-viewer :value="stringifyJson(body)" />
          </resizable-container>
        </loader-status>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import ResizableContainer from '../shared/ResizableContainer.vue'
import LoaderStatus from '../shared/LoaderStatus.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useElasticsearchAdapter } from '../../composables/CallElasticsearch.ts'
import { extractTemplateBody, TEMPLATE_METHODS } from '../../helpers/indexTemplates.ts'
import type { IndexTemplate, IndexTemplateType } from '../../types/indexTemplates.ts'
import { stringifyJson } from '../../helpers/json/stringify.ts'

const CodeViewer = defineAsyncComponent(() => import('../shared/CodeViewer.vue'))

const props = defineProps<{ row: IndexTemplate }>()
const emit = defineEmits<{ 'show-template': [name: string] }>()

const t = useTranslation()
const expand = ref(false)
const body = ref<object | null>(null)
const { requestState, callElasticsearch } = useElasticsearchAdapter()

const toggle = async () => {
  expand.value = !expand.value
  if (!expand.value || body.value) return

  const { type, name } = props.row
  try {
    body.value = extractTemplateBody(type, name, await callElasticsearch(TEMPLATE_METHODS[type], { name }))
  } catch (_e) {}
}

const TYPE_COLORS: Record<IndexTemplateType, string> = { composable: 'primary', component: 'grey', legacy: 'warning' }
</script>
