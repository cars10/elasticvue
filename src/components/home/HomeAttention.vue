<template>
  <q-card data-testid="cluster-attention">
    <q-card-section
      class="row items-center q-col-gutter-sm cursor-pointer"
      role="button"
      tabindex="0"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
      @keydown.enter.space.prevent="expanded = !expanded"
    >
      <div class="col row items-center q-gutter-sm" style="min-width: 0">
        <q-icon :name="headerIcon" :color="headerColor" size="sm" class="col-auto" />
        <div class="col" style="min-width: 0">
          <div class="text-subtitle1 text-weight-medium">{{ heading }}</div>
          <div v-if="issueCount" class="text-caption text-muted ellipsis">{{ summary }}</div>
        </div>
      </div>

      <div class="col-auto row items-center q-gutter-sm no-wrap">
        <q-badge v-if="issueCount" :color="headerColor" :text-color="headerColor === 'warning' ? 'black' : 'white'" rounded>{{
          issueCount
        }}</q-badge>
        <span v-if="!issueCount && checkCount" class="text-caption text-muted" data-testid="attention-all-passed">
          {{ allPassedLabel }}
        </span>
        <q-icon :name="expanded ? 'expand_less' : 'expand_more'" size="sm" class="text-grey-7" />
      </div>
    </q-card-section>

    <template v-if="expanded">
      <q-separator />
      <q-card-section class="row q-col-gutter-md">
        <div v-for="(column, colIndex) in columns" :key="colIndex" class="col-12 col-sm-6 q-gutter-y-md">
          <div v-for="check in column" :key="check.id" class="row items-start no-wrap q-gutter-x-sm">
            <q-icon :name="appearance[check.severity].icon" :color="appearance[check.severity].color" size="sm" class="q-mt-xs" />
            <div class="col" style="min-width: 0">
              <div class="row items-center no-wrap q-gutter-x-sm">
                <span class="text-weight-medium">{{ check.title }}</span>
                <span class="font-13" :class="appearance[check.severity].textClass">
                  {{ appearance[check.severity].label }}
                </span>
              </div>
              <template v-if="check.severity !== 'ok'">
                <div v-for="(line, i) in check.summary" :key="i" class="font-13 q-mt-xs">{{ line }}</div>
                <div v-if="check.detail.length" class="text-muted font-13 q-mt-xs">{{ check.detail.join(' ') }}</div>
                <router-link
                  v-if="check.action?.route"
                  :to="{ name: check.action.route, params: { clusterIndex: connectionStore.activeClusterIndex } }"
                  class="font-13 q-mt-xs inline-block"
                  @click.stop
                >
                  {{ check.action.label }}
                </router-link>
              </template>
            </div>
          </div>
        </div>
      </q-card-section>
    </template>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useConnectionStore } from '../../store/connection.ts'
import { useTranslation } from '../../composables/i18n.ts'
import type { AttentionCheck } from '../../types/homeDashboard.ts'

const props = defineProps<{
  checks: AttentionCheck[]
}>()

const connectionStore = useConnectionStore()
const t = useTranslation()

const appearance = computed(() => ({
  critical: { textClass: 'health--red', label: t('home.attention.severity.critical'), icon: 'error', color: 'negative' },
  warning: { textClass: 'health--yellow', label: t('home.attention.severity.warning'), icon: 'warning', color: 'warning' },
  info: { textClass: 'text-muted', label: t('home.attention.severity.info'), icon: 'info', color: 'info' },
  ok: { textClass: 'text-muted', label: t('home.attention.severity.ok'), icon: 'check_circle', color: 'positive' }
}))

/** Left: cluster/data; right: resources/pressure. */
const LEFT_IDS = ['shards', 'index-blocks', 'allocation', 'pending-tasks', 'versions']
const RIGHT_IDS = ['disk', 'rejections', 'breakers', 'jvm', 'file-descriptors', 'monitoring']

const columns = computed(() => {
  const byId = new Map(props.checks.map((check) => [check.id, check]))
  const pick = (ids: string[]) => ids.map((id) => byId.get(id)).filter((check): check is AttentionCheck => check != null)
  return [pick(LEFT_IDS), pick(RIGHT_IDS)]
})

const issues = computed(() => props.checks.filter((check) => check.severity !== 'ok'))
const criticalCount = computed(() => issues.value.filter((c) => c.severity === 'critical').length)
const warningCount = computed(() => issues.value.filter((c) => c.severity === 'warning').length)
const noticeCount = computed(() => issues.value.filter((c) => c.severity === 'info').length)
const issueCount = computed(() => issues.value.length)
const checkCount = computed(() => props.checks.length)

const allPassedLabel = computed(() => t('home.attention.all_passed', { count: checkCount.value }))

const expanded = ref(issueCount.value > 0)

watch(issueCount, (count, prev) => {
  if (count > 0 && prev === 0) expanded.value = true
})

const headerColor = computed(() => {
  if (criticalCount.value) return 'negative'
  if (warningCount.value) return 'warning'
  if (noticeCount.value) return 'info'
  return 'positive'
})

const headerIcon = computed(() => {
  if (criticalCount.value) return 'error'
  if (warningCount.value) return 'warning'
  if (noticeCount.value) return 'info'
  return 'check_circle'
})

const heading = computed(() => (issueCount.value ? t('home.attention.issues') : t('home.attention.no_issues')))

const summary = computed(() => {
  const parts: string[] = []
  if (criticalCount.value) parts.push(t('home.attention.counts.critical', { count: criticalCount.value }, criticalCount.value))
  if (warningCount.value) parts.push(t('home.attention.counts.warning', { count: warningCount.value }, warningCount.value))
  if (noticeCount.value) parts.push(t('home.attention.counts.info', { count: noticeCount.value }, noticeCount.value))
  return parts.join(', ')
})
</script>
