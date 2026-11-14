import { stringify } from 'lossless-json'

export const stringifyJson = (json: unknown, replacer?: null, space?: number | string): string =>
  stringify(json, replacer, space) as string
