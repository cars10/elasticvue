<template>
  <div ref="root" class="row items-center col-auto">
    <div class="relative-position col-auto" :style="{ width: `${size}px`, height: `${size}px` }">
      <canvas ref="canvasEl" class="fit block" aria-hidden="true" />
      <div class="absolute-full flex flex-center text-weight-bold text-h6" :class="valueClass">
        {{ label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { ArcElement, Chart, DoughnutController, type ChartConfiguration } from 'chart.js'
import { resolveCssVar, useChart } from '../../composables/Chart.ts'
import { useThemeStore } from '../../store/theme.ts'

Chart.register(DoughnutController, ArcElement)

const props = withDefaults(
  defineProps<{
    value: number | null
    warnAt?: number
    dangerAt?: number
    /** When true, low values warn/danger (e.g. shard allocation %). Default: high values warn. */
    higherIsBetter?: boolean
    size?: number
  }>(),
  {
    warnAt: 75,
    dangerAt: 85,
    higherIsBetter: false,
    size: 56
  }
)

const themeStore = useThemeStore()
const root = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)

const label = computed(() => {
  if (props.value == null || Number.isNaN(props.value)) return '—'
  return `${Math.round(props.value)}%`
})

const tone = computed(() => {
  if (props.value == null || Number.isNaN(props.value)) return 'muted'
  if (props.higherIsBetter) {
    if (props.value < props.dangerAt) return 'danger'
    if (props.value < props.warnAt) return 'warn'
    return 'ok'
  }
  if (props.value >= props.dangerAt) return 'danger'
  if (props.value >= props.warnAt) return 'warn'
  return 'ok'
})

const valueClass = computed(() => {
  if (tone.value === 'danger') return 'health--red'
  if (tone.value === 'warn') return 'health--yellow'
  return undefined
})

const colors = () => {
  const fill =
    tone.value === 'danger'
      ? resolveCssVar(root.value, '--theme-negative', '#dc2626')
      : tone.value === 'warn'
        ? resolveCssVar(root.value, '--theme-warning', '#ca8a04')
        : resolveCssVar(root.value, '--theme-primary', '#2563eb')
  const track = resolveCssVar(root.value, '--theme-separator-background', '#e5e7eb')
  return { fill, track }
}

const dataset = () => {
  const used = Math.min(100, Math.max(0, props.value ?? 0))
  const free = Math.max(0, 100 - used)
  const { fill, track } = colors()

  if (props.value == null) {
    return { data: [0, 1], backgroundColor: [track, track] }
  }

  return {
    data: used <= 0 ? [0.0001, 100] : [used, Math.max(free, 0.0001)],
    backgroundColor: [fill, track]
  }
}

const chartConfig = (): ChartConfiguration<'doughnut'> => {
  const { data, backgroundColor } = dataset()

  return {
    type: 'doughnut',
    data: {
      datasets: [
        {
          data,
          backgroundColor,
          borderWidth: 0,
          hoverOffset: 0
        }
      ]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: false,
      cutout: '70%',
      events: [],
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  }
}

useChart(canvasEl, chartConfig, {
  size: toRef(props, 'size'),
  watch: [() => [props.value, props.warnAt, props.dangerAt, props.higherIsBetter, themeStore.appTheme]]
})
</script>
