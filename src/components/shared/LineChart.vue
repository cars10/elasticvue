<template>
  <div ref="root" class="line-chart" :style="{ height: `${height}px` }">
    <canvas ref="canvasEl" class="fit block" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import {
  CategoryScale,
  Chart,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  type ChartConfiguration
} from 'chart.js'
import { resolveCssVar, useChart } from '../../composables/Chart.ts'
import { useThemeStore } from '../../store/theme.ts'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler)

const props = withDefaults(
  defineProps<{
    values: number[]
    height?: number
  }>(),
  {
    height: 48
  }
)

const themeStore = useThemeStore()
const root = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)

let resizeObserver: ResizeObserver | null = null

const chartConfig = (): ChartConfiguration<'line'> => {
  const stroke = resolveCssVar(root.value, '--theme-primary', '#2563eb')

  return {
    type: 'line',
    data: {
      labels: props.values.map((_, i) => String(i)),
      datasets: [
        {
          data: props.values.slice(),
          borderColor: stroke,
          backgroundColor: `${stroke}22`,
          borderWidth: 1.5,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 0,
          spanGaps: true
        }
      ]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: false,
      events: [],
      layout: {
        padding: 0
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: {
          display: false,
          grid: { display: false }
        },
        y: {
          display: false,
          beginAtZero: true,
          grid: { display: false }
        }
      }
    }
  }
}

const { render, recreate, resize } = useChart(canvasEl, chartConfig, {
  // Parent replaces the array on each sample; shallow watch keeps updates cheap.
  watch: [() => props.values, () => themeStore.appTheme]
})

const syncCanvasSize = () => {
  if (!canvasEl.value || !root.value) return false
  const width = Math.max(1, Math.floor(root.value.clientWidth))
  const height = props.height
  if (canvasEl.value.width === width && canvasEl.value.height === height) return false
  canvasEl.value.width = width
  canvasEl.value.height = height
  return true
}

onMounted(() => {
  if (syncCanvasSize()) recreate()
  if (typeof ResizeObserver === 'undefined' || !root.value) return

  resizeObserver = new ResizeObserver(() => {
    if (!syncCanvasSize()) return
    resize()
    render()
  })
  resizeObserver.observe(root.value)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch(
  () => props.height,
  () => {
    if (!syncCanvasSize()) return
    resize()
    render()
  }
)
</script>

<style scoped>
.line-chart {
  width: 100%;
  min-width: 0;
  position: relative;
  overflow: hidden;
}
</style>
