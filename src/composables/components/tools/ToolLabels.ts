import { useTranslation } from '../../i18n.ts'

export const useToolLabels = () => {
  const t = useTranslation()
  const pick = (labels: Record<string, string>, value: string | null | undefined) => labels[value || ''] ?? value ?? ''

  return {
    allocationMode: (mode: string) =>
      pick(
        {
          all: t('tools.allocation.modes.all'),
          primaries: t('tools.allocation.modes.primaries'),
          new_primaries: t('tools.allocation.modes.new_primaries'),
          none: t('tools.allocation.modes.none')
        },
        mode
      ),
    allocationHint: (mode: string) =>
      pick(
        {
          all: t('tools.allocation.option_hints.all'),
          primaries: t('tools.allocation.option_hints.primaries'),
          new_primaries: t('tools.allocation.option_hints.new_primaries'),
          none: t('tools.allocation.option_hints.none')
        },
        mode
      ),
    allocationConfirm: (mode: string) =>
      pick(
        {
          primaries: t('tools.allocation.confirm.primaries'),
          new_primaries: t('tools.allocation.confirm.new_primaries'),
          none: t('tools.allocation.confirm.none')
        },
        mode
      ),
    rebalancingMode: (mode: string) =>
      pick(
        {
          all: t('tools.rebalancing.modes.all'),
          primaries: t('tools.rebalancing.modes.primaries'),
          replicas: t('tools.rebalancing.modes.replicas'),
          none: t('tools.rebalancing.modes.none')
        },
        mode
      ),
    clusterWriteMode: (mode: string) =>
      pick(
        {
          normal: t('tools.cluster_write.modes.normal'),
          read_only: t('tools.cluster_write.modes.read_only'),
          allow_delete: t('tools.cluster_write.modes.allow_delete')
        },
        mode
      ),
    autoCreateMode: (mode: string) =>
      pick(
        {
          default: t('tools.status.default'),
          allow: t('tools.auto_create.modes.allow'),
          disable: t('tools.auto_create.modes.disable'),
          custom: t('tools.auto_create.modes.custom')
        },
        mode
      ),
    source: (source: string) =>
      pick(
        {
          transient: t('tools.sources.transient'),
          persistent: t('tools.sources.persistent'),
          default: t('tools.sources.default'),
          unavailable: t('tools.sources.unavailable')
        },
        source
      ),
    inspect: (what: string) =>
      pick(
        {
          settings: t('tools.inspect.settings'),
          nodes: t('tools.inspect.nodes'),
          shards: t('tools.inspect.shards'),
          indices: t('tools.inspect.indices'),
          explanation: t('tools.inspect.explanation'),
          voting: t('tools.inspect.voting')
        },
        what
      ),
    health: (status: string) =>
      pick(
        {
          green: t('tools.health.green'),
          yellow: t('tools.health.yellow'),
          red: t('tools.health.red')
        },
        status
      ),
    group: (group: string) =>
      pick(
        {
          attention: t('tools.groups.attention'),
          shards: t('tools.groups.shards'),
          indices: t('tools.groups.indices'),
          disk: t('tools.groups.disk'),
          safety: t('tools.groups.safety'),
          advanced: t('tools.groups.advanced')
        },
        group
      ),
    watermark: (level: string) =>
      pick(
        {
          low: t('tools.watermarks.low'),
          high: t('tools.watermarks.high'),
          flood: t('tools.watermarks.flood'),
          lowMaxHeadroom: t('tools.watermarks.low_max_headroom'),
          highMaxHeadroom: t('tools.watermarks.high_max_headroom'),
          floodMaxHeadroom: t('tools.watermarks.flood_max_headroom')
        },
        level
      ),
    watermarkMode: (mode: string | null) =>
      pick({ percent: t('tools.watermarks.mode_percent'), bytes: t('tools.watermarks.mode_bytes') }, mode),
    watermarkError: (error: string) =>
      pick(
        {
          mixed: t('tools.watermarks.errors.mixed'),
          percent_order: t('tools.watermarks.errors.percent_order'),
          bytes_order: t('tools.watermarks.errors.bytes_order')
        },
        error
      ),
    floodState: (state: string) =>
      pick(
        {
          full: t('tools.blocks.flood_full'),
          recovered: t('tools.blocks.flood_recovered'),
          unknown: t('tools.blocks.flood_unknown')
        },
        state
      ),
    allocationTitle: (primary: boolean) =>
      primary ? t('tools.explain.cannot_allocate_primary') : t('tools.explain.cannot_allocate_replica')
  }
}
