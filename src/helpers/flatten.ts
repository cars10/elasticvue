export const flattenObj = (object: any) => {
  const result: Record<string, any> = {}

  for (const i in object) {

    if ((typeof object[i]) === 'object' && !Array.isArray(object[i])) {
      const temp = flattenObj(object[i])
      for (const j in temp) {
        result[i + '.' + j] = temp[j]
      }
    } else {
      result[i] = object[i]
    }
  }
  return result
}
