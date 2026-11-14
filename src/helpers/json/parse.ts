import stripJsonComments from 'strip-json-comments'
import { isInteger, isSafeNumber, parse } from 'lossless-json'

const MAYBE_UNSAFE_INTEGER = /(?<![\d.])\d{16,}(?![\d.eE])/
const MAYBE_COMMENT = /\/[/*]/

const parseNumber = (value: string) => (isInteger(value) && !isSafeNumber(value) ? BigInt(value) : parseFloat(value))

export const parseJson = (jsonString: string): any => {
  const clean = MAYBE_COMMENT.test(jsonString) ? stripJsonComments(jsonString) : jsonString
  if (!MAYBE_UNSAFE_INTEGER.test(clean)) return JSON.parse(clean)

  try {
    return parse(clean, null, parseNumber)
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('Duplicate key')) return JSON.parse(clean)
    throw e
  }
}
