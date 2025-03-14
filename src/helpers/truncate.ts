export const truncateString = (input: string, maxLength: number, suffix = '...') => {
  if (typeof input !== 'string' || input.length <= maxLength) return input

  return input.slice(0, maxLength - suffix.length) + suffix
}
