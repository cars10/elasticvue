const JsonBigInt = require('json-bigint')({ protoAction: 'preserve', constructorAction: 'preserve' })

export const parseJsonBigInt = (...args) => {
  return JsonBigInt.parse(...args)
}

export const stringifyJsonBigInt = (...args) => {
  return JsonBigInt.stringify(...args)
}
