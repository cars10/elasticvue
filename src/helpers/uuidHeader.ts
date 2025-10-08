import { getUuid } from '../services/Uuid.ts'
import { UUID_HEADER_NAME } from '../consts.ts'

export const uuidHeader = () => {
  return {
    [UUID_HEADER_NAME]: getUuid() || ''
  }
}
