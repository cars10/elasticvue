import stripJsonComments from 'strip-json-comments'
import { bigint } from './jsonBigint.ts'

export const parseJson = (jsonString: string): any => {
  const clean = stripJsonComments(jsonString)
  return bigint.parse(clean)
}
