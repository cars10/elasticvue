import { invoke } from '@tauri-apps/api/tauri'
import { DESKTOP_BUILD } from '@/consts'

export const fetchReqwest = (resource, init) => {
  return invoke('fetch_reqwest', { resource, init }).then(r => (new FetchReqwestResponse(r)))
}
export const fetchMethod = DESKTOP_BUILD ? fetchReqwest : window.fetch

class FetchReqwestResponseHeaders {
  constructor (headers) {
    this.headers = headers
  }

  get (header) {
    return this.headers[header]
  }
}

class FetchReqwestResponse {
  constructor (response) {
    this.headers = new FetchReqwestResponseHeaders(response.headers)
    this.ok = response.ok
    this.status = response.status
    this.statusText = response.status_text
    this.body = response.text
  }

  text () {
    return Promise.resolve(this.body)
  }

  json () {
    try {
      return Promise.resolve(JSON.parse(this.body))
    } catch (e) {
      return Promise.reject(e)
    }
  }
}
