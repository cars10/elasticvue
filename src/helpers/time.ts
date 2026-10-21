export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000) % 60
  const minutes = Math.floor(ms / (1000 * 60)) % 60
  const hours = Math.floor(ms / (1000 * 60 * 60))

  const parts = []
  if (hours) parts.push(`${hours}h`)
  if (minutes) parts.push(`${minutes}m`)
  if (seconds || parts.length === 0) parts.push(`${seconds}s`)

  return parts.join(' ')
}

const coarseDuration = (ms: number): string => {
  const minutes = Math.floor(ms / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days) return `${days}d`
  if (hours) return `${hours}h`
  return `${minutes}m`
}

export const formatTimeAgo = (ms: number, now: number = Date.now()): string => {
  const diff = now - ms
  if (diff < 60 * 1000) return 'just now'
  return `${coarseDuration(diff)} ago`
}

export const formatTimeIn = (ms: number, now: number = Date.now()): string => {
  const diff = ms - now
  if (diff < 60 * 1000) return 'now'
  return `in ${coarseDuration(diff)}`
}
