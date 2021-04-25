const JsonBigInt = require('json-bigint')()

export const parseJsonBigInt = (...args) => {
  return JsonBigInt.parse(...args)
}

export const stringifyJsonBigInt = (...args) => {
  return JsonBigInt.stringify(...args)
}
