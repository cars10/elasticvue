export const stringifyBigInt = (json: object): string => {
  const str = JSON.stringify(json, (key, value) => {
    if (typeof value === 'bigint') {
      return `BIGINT::${value.toString()}`
    } else {
      return value
    }
  })

  return str.replaceAll(/\"(BIGINT::)(\d*)\"/g, (str, match, digit) => digit)
}
