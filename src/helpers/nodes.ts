import { prettyPrintByteString } from './bytes.ts'
import { peakMetric, toNumber } from './nodeStats.ts'
import type { EsNode } from '../types/types.ts'
import type { DiskWatermarks } from '../types/homeDashboard.ts'
import type { NodeRow, NodesSummary, NodeStatsDetails } from '../types/nodes.ts'

export const nodeRoleTitle = (role: string): string => {
  let title = ''
  if (role.includes('c')) title += 'c - cold node\r\n'
  if (role.includes('d')) title += 'd - data node\r\n'
  if (role.includes('f')) title += 'f - frozen node\r\n'
  if (role.includes('h')) title += 'h - hot node\r\n'
  if (role.includes('i')) title += 'i - ingest node\r\n'
  if (role.includes('l')) title += 'l - machine learning node\r\n'
  if (role.includes('m')) title += 'm - master-eligible node\r\n'
  if (role.includes('r')) title += 'r - remote cluster client node\r\n'
  if (role.includes('s')) title += 's - content node\r\n'
  if (role.includes('t')) title += 't - transform node\r\n'
  if (role.includes('v')) title += 'v - voting-only node\r\n'
  if (role.includes('w')) title += 'w - warm node\r\n'
  if (role.includes('-')) title += 'coordinating nodes\r\n'

  return title
}

export const CAT_NODES_PARAMS = {
  h: [
    'ip',
    'id',
    'name',
    'version',
    'heap.percent',
    'heap.current',
    'heap.max',
    'node.role',
    'master',
    'cpu',
    'disk.used_percent',
    'disk.used',
    'disk.total',
    'shards' // es >= 8
  ],
  bytes: 'b',
  full_id: true
}

/** Nodes whose JVM started more recently than this count as restarted. */
export const RECENT_RESTART_MS = 60 * 60 * 1000

/** Display order and short labels for role letters. `r` (remote cluster client) is on almost every node, so it only shows in the tooltip. */
const ROLE_LABELS: [string, string][] = [
  ['m', 'master'],
  ['v', 'voting-only'],
  ['d', 'data'],
  ['s', 'content'],
  ['h', 'hot'],
  ['w', 'warm'],
  ['c', 'cold'],
  ['f', 'frozen'],
  ['i', 'ingest'],
  ['l', 'ml'],
  ['t', 'transform']
]

/** Tier roles are implied by the generic data role `d`. */
const DATA_TIER_ROLES = ['s', 'h', 'w', 'c', 'f']

export const isDataNode = (roles: string): boolean => /[dshwcf]/.test(roles)

export const nodeRoleLabels = (roles: string): { role: string; label: string }[] => {
  if (roles === '-') return [{ role: '-', label: 'coordinating' }]

  const hasData = roles.includes('d')
  return ROLE_LABELS.filter(([role]) => roles.includes(role) && !(hasData && DATA_TIER_ROLES.includes(role))).map(
    ([role, label]) => ({ role, label })
  )
}

export const buildNodeRows = (
  catNodes: EsNode[],
  details: Record<string, NodeStatsDetails>,
  attributes: Record<string, Record<string, string>>
): NodeRow[] =>
  catNodes.map((node) => ({
    id: node.id,
    name: node.name,
    ip: node.ip,
    version: node.version,
    roles: node['node.role'] || '',
    master: node.master === '*',
    attributes: attributes[node.id] || {},
    cpuPercent: toNumber(node.cpu),
    heapPercent: toNumber(node['heap.percent']),
    heapUsedBytes: toNumber(node['heap.current']),
    heapMaxBytes: toNumber(node['heap.max']),
    diskPercent: toNumber(node['disk.used_percent']),
    diskUsedBytes: toNumber(node['disk.used']),
    diskTotalBytes: toNumber(node['disk.total']),
    shards: toNumber(node.shards),
    uptimeMs: details[node.id]?.uptimeMs ?? null,
    docs: details[node.id]?.docs ?? null,
    storeBytes: details[node.id]?.storeBytes ?? null
  }))

const average = (values: (number | null)[]): number | null => {
  const present = values.filter((value): value is number => value != null)
  if (present.length === 0) return null
  return present.reduce((sum, value) => sum + value, 0) / present.length
}

const summarizeDisk = (nodes: NodeRow[], watermarks: DiskWatermarks): NodesSummary['disk'] => {
  let usedBytes = 0
  let totalBytes = 0
  let aboveLow = 0
  let aboveHigh = 0
  let aboveFlood = 0

  for (const node of nodes) {
    usedBytes += node.diskUsedBytes || 0
    totalBytes += node.diskTotalBytes || 0

    const percent = node.diskPercent
    if (percent == null) continue
    if (watermarks.floodPercent != null && percent >= watermarks.floodPercent) aboveFlood++
    else if (watermarks.highPercent != null && percent >= watermarks.highPercent) aboveHigh++
    else if (watermarks.lowPercent != null && percent >= watermarks.lowPercent) aboveLow++
  }

  const percent = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : null
  return { usedBytes, totalBytes, percent, aboveLow, aboveHigh, aboveFlood }
}

const summarizeShards = (nodes: NodeRow[]): NodesSummary['shards'] => {
  const withShards = nodes.filter((node) => node.shards != null)
  if (withShards.length === 0) return null

  let busiest = withShards[0]
  let min = Infinity
  let total = 0
  for (const node of withShards) {
    const shards = node.shards as number
    total += shards
    min = Math.min(min, shards)
    if (shards > (busiest.shards as number)) busiest = node
  }

  const max = busiest.shards as number
  const avg = total / withShards.length
  return { nodes: withShards.length, min, max, avg, skew: avg > 0 ? max / avg : 1, busiest: busiest.name }
}

export const summarizeNodes = (nodes: NodeRow[], watermarks: DiskWatermarks): NodesSummary => {
  const dataNodes = nodes.filter((node) => isDataNode(node.roles))

  return {
    total: nodes.length,
    roles: {
      masterEligible: nodes.filter((node) => node.roles.includes('m')).length,
      data: dataNodes.length,
      ingest: nodes.filter((node) => node.roles.includes('i')).length,
      ml: nodes.filter((node) => node.roles.includes('l')).length,
      coordinating: nodes.filter((node) => node.roles === '-').length
    },
    versions: [...new Set(nodes.map((node) => node.version).filter(Boolean))].sort(),
    recentlyRestarted: nodes
      .filter((node) => node.uptimeMs != null && node.uptimeMs < RECENT_RESTART_MS)
      .map((node) => node.name),
    cpu: { avg: average(nodes.map((node) => node.cpuPercent)), peak: peakMetric(nodes, 'cpuPercent') },
    heap: {
      avg: average(nodes.map((node) => node.heapPercent)),
      peak: peakMetric(nodes, 'heapPercent', (node) =>
        node.heapUsedBytes != null && node.heapMaxBytes != null
          ? `${prettyPrintByteString(node.heapUsedBytes)} / ${prettyPrintByteString(node.heapMaxBytes)}`
          : null
      )
    },
    // Watermarks only apply to data nodes; fall back to all nodes when roles are unknown
    disk: summarizeDisk(dataNodes.length > 0 ? dataNodes : nodes, watermarks),
    shards: summarizeShards(dataNodes)
  }
}

export const formatUptime = (ms?: number | null): string => {
  if (ms == null) return '—'

  const minutes = Math.floor(ms / 60_000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}

const compactNumber = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

export const formatCount = (value?: number | null): string => (value == null ? '—' : compactNumber.format(value))
