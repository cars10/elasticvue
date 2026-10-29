<template>
  <div ref="root" class="relative-position" style="height: 110px" data-testid="search-histogram">
    <canvas ref="canvasEl" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip, type ChartConfiguration } from 'chart.js'
import { resolveCssVar, useChart } from '../../composables/Chart.ts'
import { useThemeStore } from '../../store/theme.ts'
import { durationMs } from '../../helpers/search/timeRange.ts'
import type { HistogramBucket } from '../../composables/components/search/SearchHistogram.ts'
import type { SearchTimeBounds } from '../../types/search.ts'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

const props = defineProps<{ buckets: HistogramBucket[]; interval: string }>()
const emit = defineEmits<{ select: [range: SearchTimeBounds] }>()

const themeStore = useThemeStore()
const root = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)

const formatKey = (key: number) => {
  const step = durationMs(props.interval) ?? 0
  if (step >= 86_400_000) return new Date(key).toLocaleDateString()
  const time = new Date(key).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    ...(step < 60_000 && { second: '2-digit' })
  })
  return `${new Date(key).toLocaleDateString()} ${time}`
}

const select = (index: number) => {
  const key = props.buckets[index]?.key
  if (key === undefined) return
  const to = key + (durationMs(props.interval) ?? 0) - 1
  emit('select', { from: new Date(key).toISOString(), to: new Date(to).toISOString() })
}

const chartConfig = (): ChartConfiguration<'bar'> => {
  const primary = resolveCssVar(root.value, '--theme-primary', '#2563eb')
  const muted = resolveCssVar(root.value, '--theme-muted-color', '#888')
  const grid = resolveCssVar(root.value, '--theme-separator-background', '#8884')

  return {
    type: 'bar',
    data: {
      labels: props.buckets.map((bucket) => formatKey(bucket.key)),
      datasets: [{ data: props.buckets.map((bucket) => bucket.doc_count), backgroundColor: primary, barPercentage: 0.9 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: 'index', intersect: false },
      onClick: (_event, elements) => elements.length && select(elements[0].index),
      onHover(event, elements) {
        const target = event.native?.target
        if (target instanceof HTMLElement) target.style.cursor = elements.length ? 'pointer' : 'default'
      },
      plugins: {
        legend: { display: false },
        tooltip: { displayColors: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: muted, maxRotation: 0, autoSkip: true, autoSkipPadding: 24, font: { size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: grid },
          border: { display: false },
          ticks: { color: muted, maxTicksLimit: 3, precision: 0, font: { size: 11 } }
        }
      }
    }
  }
}

useChart(canvasEl, chartConfig, { watch: [() => props.buckets, () => themeStore.appTheme] })
</script>
