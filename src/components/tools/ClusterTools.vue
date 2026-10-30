<template>
  <div class="tools-page" data-testid="tools-page">
    <div class="row items-start justify-between q-mb-lg q-col-gutter-md">
      <div class="col-12 col-md">
        <h1 class="page-title">{{ t('tools.heading') }}</h1>
        <div class="text-muted q-mt-xs">{{ t('tools.subtitle') }}</div>
      </div>
      <div class="col-12 col-md-auto row items-center no-wrap q-gutter-sm">
        <q-input
          v-model="filter"
          outlined
          dense
          clearable
          class="tools-filter"
          :aria-label="t('tools.filter')"
          :placeholder="t('tools.filter')"
        >
          <template #prepend>
            <q-icon name="search" size="18px" />
          </template>
        </q-input>
        <reload-button :action="tools.refresh" />
      </div>
    </div>

    <section v-for="group in groups" :key="group.id" class="q-mb-lg" :aria-labelledby="`tools-${group.id}`">
      <h2 :id="`tools-${group.id}`" class="section-title" :class="{ 'text-warning-strong': group.id === 'attention' }">
        {{ labels.group(group.id) }}
      </h2>
      <q-card>
        <q-list separator>
          <q-item
            v-for="tool in group.tools"
            :key="tool.id"
            clickable
            class="tool-row"
            :data-testid="`tool-${tool.id.replaceAll('_', '-')}`"
            @click="open(tool)"
          >
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ tool.title }}</q-item-label>
              <q-item-label caption class="text-muted">{{ tool.description }}</q-item-label>
            </q-item-section>
            <q-item-section side class="tool-row__status" :class="{ 'tool-row__status--attention': tool.attention }">
              <span class="row items-center no-wrap" data-testid="tool-status">
                <q-icon v-if="tool.attention" name="warning" size="16px" class="q-mr-xs" />
                {{ tool.status }}
              </span>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" size="20px" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </section>

    <div v-if="!groups.length" class="text-muted q-pa-md">{{ t('tools.no_match', { filter }) }}</div>

    <tool-panel v-if="selectedTool" :tool="selectedTool" @close="close" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTranslation } from '../../composables/i18n.ts'
import { provideClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { useToolLabels } from '../../composables/components/tools/ToolLabels.ts'
import { TOOL_GROUPS, ToolDefinition, useToolDefinitions } from './toolDefinitions.ts'
import ReloadButton from '../shared/ReloadButton.vue'
import ToolPanel from './ToolPanel.vue'

const t = useTranslation()
const labels = useToolLabels()
const route = useRoute()
const router = useRouter()
const tools = provideClusterTools()
const definitions = useToolDefinitions(tools)
const filter = ref<string | null>('')

const matches = (tool: ToolDefinition) => {
  const terms = (filter.value || '').trim().toLowerCase().split(/\s+/).filter(Boolean)
  const text = [tool.title, tool.description, tool.keywords, ...tool.endpoints].join(' ').toLowerCase()
  return terms.every((term) => text.includes(term))
}

const groups = computed(() => {
  const visible = definitions.value.filter(matches)
  return [
    { id: 'attention', tools: visible.filter((tool) => tool.attention) },
    ...TOOL_GROUPS.map((id) => ({ id, tools: visible.filter((tool) => tool.group === id && !tool.attention) }))
  ].filter((group) => group.tools.length)
})

const selectedTool = computed(() => definitions.value.find((tool) => tool.id === route.query.tool) || null)

const open = (tool: ToolDefinition) => {
  tool.onOpen?.()
  router.replace({ query: { ...route.query, tool: tool.id } })
}

const close = () => {
  const { tool: _tool, ...query } = route.query
  router.replace({ query })
}

onMounted(tools.refresh)
</script>

<style scoped>
.tools-page {
  max-width: 1100px;
}

.tools-filter {
  width: 260px;
}

.tool-row {
  padding: 12px 16px;
}

.tool-row__status {
  min-width: 160px;
  align-items: flex-end;
  color: var(--theme-muted-color);
  font-size: 13px;
}

.tool-row__status--attention {
  color: var(--theme-warning-text);
  font-weight: 500;
}

.text-warning-strong {
  color: var(--theme-warning-text);
}
</style>
