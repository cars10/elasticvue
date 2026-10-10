import { Chart, type ChartConfiguration, type ChartType } from 'chart.js'
import {
  nextTick,
  onMounted,
  onUnmounted,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
  type WatchSource
} from 'vue'

export const resolveCssVar = (el: Element | null | undefined, name: string, fallback: string) => {
  const resolved = getComputedStyle(el || document.body).getPropertyValue(name).trim()
  return resolved || fallback
}

export const useChart = <TType extends ChartType = ChartType>(
  canvasEl: Ref<HTMLCanvasElement | null>,
  getConfig: () => ChartConfiguration<TType>,
  {
    size,
    watch: watchSources = []
  }: {
    size?: MaybeRefOrGetter<number | undefined>
    watch?: WatchSource[]
  } = {}
) => {
  let chart: Chart<TType> | null = null

  const destroy = () => {
    chart?.destroy()
    chart = null
  }

  const applyConfig = (config: ChartConfiguration<TType>) => {
    if (!chart) return

    chart.data.labels = config.data.labels

    const nextDatasets = config.data.datasets
    if (chart.data.datasets.length === nextDatasets.length) {
      nextDatasets.forEach((dataset, index) => {
        Object.assign(chart!.data.datasets[index], dataset)
      })
    } else {
      chart.data.datasets = nextDatasets
    }

    if (config.options) {
      Object.assign(chart.options as object, config.options as object)
    }
  }

  const render = () => {
    if (!canvasEl.value) return

    const resolvedSize = toValue(size)
    if (resolvedSize != null) {
      canvasEl.value.width = resolvedSize
      canvasEl.value.height = resolvedSize
    }

    if (chart) {
      applyConfig(getConfig())
      chart.update('none')
      return
    }

    chart = new Chart(canvasEl.value, getConfig())
  }

  const resize = () => {
    chart?.resize()
  }

  const recreate = async () => {
    await nextTick()
    destroy()
    render()
  }

  watch(watchSources, async () => {
    await nextTick()
    render()
  })

  if (size != null) {
    watch(() => toValue(size), recreate)
  }

  onMounted(render)
  onUnmounted(destroy)

  return { render, recreate, resize }
}
