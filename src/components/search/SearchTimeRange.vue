<template>
  <q-btn unelevated no-caps color="dark-grey" icon="schedule" :label="label" data-testid="search-time-range">
    <q-menu ref="menu" anchor="bottom right" self="top right" @before-show="resetAbsolute">
      <div class="row no-wrap q-pa-sm q-gutter-x-md">
        <q-list dense style="min-width: 160px">
          <q-item
            v-for="preset in [...TIME_PRESETS, null]"
            :key="String(preset)"
            v-close-popup
            clickable
            :active="activePreset === preset"
            data-testid="search-time-preset"
            @click="emit('update:modelValue', preset ? presetRange(preset) : null)"
          >
            <q-item-section>{{ presetLabel(preset) }}</q-item-section>
          </q-item>
        </q-list>

        <q-form class="column q-gutter-y-sm" style="width: 240px" @submit.prevent="applyAbsolute">
          <div class="text-muted font-13">{{ t('search.time.absolute') }}</div>
          <q-input
            v-for="bound in BOUNDS"
            :key="bound"
            v-model="absolute[bound]"
            dense
            outlined
            mask="####-##-## ##:##:##"
            :label="boundLabels[bound]"
            :rules="[(value: string) => isValidLocal(value) || t('search.time.invalid')]"
            hide-bottom-space
            :data-testid="`search-time-${bound}`"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover>
                  <q-date v-model="absolute[bound]" :dark="dark" mask="YYYY-MM-DD HH:mm:ss" minimal />
                </q-popup-proxy>
              </q-icon>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy cover>
                  <q-time v-model="absolute[bound]" :dark="dark" mask="YYYY-MM-DD HH:mm:ss" format24h with-seconds />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-btn
            type="submit"
            unelevated
            no-caps
            color="primary-dark"
            :label="t('search.time.apply')"
            data-testid="search-time-apply"
          />

          <q-select
            v-if="fields.length > 1"
            :model-value="field"
            :options="fields"
            dense
            outlined
            options-dense
            :label="t('search.time.field')"
            data-testid="search-time-field"
            @update:model-value="(value: string) => emit('update:field', value)"
          />
        </q-form>
      </div>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { date, QMenu } from 'quasar'
import { parseTime, presetOf, presetRange, TIME_PRESETS } from '../../helpers/search/timeRange.ts'
import { useTranslation } from '../../composables/i18n.ts'
import { AppThemes, useThemeStore } from '../../store/theme.ts'
import type { SearchTimeBounds } from '../../types/search.ts'

const BOUNDS = ['from', 'to'] as const
const LOCAL_FORMAT = 'YYYY-MM-DD HH:mm:ss'

const props = defineProps<{ modelValue: SearchTimeBounds | null; field: string | null; fields: string[] }>()
const emit = defineEmits<{ 'update:modelValue': [range: SearchTimeBounds | null]; 'update:field': [field: string] }>()
const t = useTranslation()
const themeStore = useThemeStore()
const dark = computed(() => themeStore.appTheme === AppThemes.dark)

const activePreset = computed(() => (props.modelValue ? presetOf(props.modelValue) : null))
const presetLabels: Record<string, string> = {
  '15m': t('search.time.presets.last_15m'),
  '1h': t('search.time.presets.last_1h'),
  '4h': t('search.time.presets.last_4h'),
  '24h': t('search.time.presets.last_24h'),
  '7d': t('search.time.presets.last_7d'),
  '30d': t('search.time.presets.last_30d'),
  all: t('search.time.presets.all')
}
const boundLabels = { from: t('search.time.from'), to: t('search.time.to') }
const presetLabel = (preset: string | null) => presetLabels[preset ?? 'all']

const menu = ref<QMenu | null>(null)

const toLocal = (value: string) => {
  const time = parseTime(value)
  return time === null ? '' : date.formatDate(time, LOCAL_FORMAT)
}
const isValidLocal = (value: string) => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) && date.isValid(value)
const fromLocal = (value: string) => date.extractDate(value, LOCAL_FORMAT).toISOString()

const label = computed(() => {
  const range = props.modelValue
  if (!range) return presetLabel(null)
  const preset = presetOf(range)
  if (preset && TIME_PRESETS.includes(preset)) return presetLabel(preset)
  const format = (value: string) => (value.startsWith('now') ? value : toLocal(value))
  return `${format(range.from)} → ${format(range.to)}`
})

const absolute = reactive({ from: '', to: '' })
const resetAbsolute = () => {
  const range = props.modelValue ?? presetRange('15m')
  absolute.from = toLocal(range.from)
  absolute.to = toLocal(range.to)
}

const applyAbsolute = () => {
  if (!isValidLocal(absolute.from) || !isValidLocal(absolute.to)) return
  emit('update:modelValue', { from: fromLocal(absolute.from), to: fromLocal(absolute.to) })
  menu.value?.hide()
}
</script>
