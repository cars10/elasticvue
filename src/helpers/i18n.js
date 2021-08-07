export const getBrowserLocale = () => {
  const navigatorLocale =
    navigator.languages !== undefined
      ? navigator.languages[0]
      : navigator.language
  if (!navigatorLocale) return undefined
  return navigatorLocale.trim().split(/-|_/)[0]
}
