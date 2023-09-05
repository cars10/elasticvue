import { bigint } from './jsonBigint.ts'

export const stringifyJson = (json: object, ...args: any[]): string => {
  return bigint.stringify(json, ...args)
}
