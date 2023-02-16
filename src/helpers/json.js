import { parseJsonCommentsBigInt } from '../services/json/parse'

export const parseJson = text => {
  return parseJsonCommentsBigInt(text)
}