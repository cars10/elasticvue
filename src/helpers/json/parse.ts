import { bigint } from './jsonBigint.ts'

export const removeComments = (str: string): string => {
  return str.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => (g ? '' : m))
}

export const parseJson = (jsonString: string): any => {
  const clean = removeComments(jsonString)
  return bigint.parse(clean)
}
