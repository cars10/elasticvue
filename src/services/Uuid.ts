import { v4 as uuidv4 } from 'uuid'

const key = 'elasticvueUuid'
export const setUuid = () => {
  if (localStorage.getItem(key)) return

  const uuid = uuidv4()
  localStorage.setItem(key, uuid)
}

export const getUuid = () => {
  return localStorage.getItem(key)
}