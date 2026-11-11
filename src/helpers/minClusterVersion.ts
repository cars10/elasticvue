export const parseVersionParts = (version: string): number[] =>
  version
    .split('.')
    .map((part) => parseInt(part, 10))
    .map((part) => (Number.isFinite(part) ? part : 0))

export const versionAtLeast = (current: string | undefined | null, required: string): boolean => {
  if (!current) return false

  const currentParts = parseVersionParts(current)
  const requiredParts = parseVersionParts(required)
  const length = Math.max(currentParts.length, requiredParts.length)

  for (let i = 0; i < length; i++) {
    const a = currentParts[i] ?? 0
    const b = requiredParts[i] ?? 0
    if (a > b) return true
    if (a < b) return false
  }

  return true
}
