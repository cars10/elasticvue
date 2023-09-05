import JsonBigInt from 'json-bigint'

export const bigint = JsonBigInt({ protoAction: 'preserve', constructorAction: 'preserve', useNativeBigInt: false })
