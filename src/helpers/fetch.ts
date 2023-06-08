import { DESKTOP_BUILD } from '../consts'
import { invoke } from '@tauri-apps/api/tauri'

export const fetchReqwest = (resource: any, init: any) => {
  return invoke('fetch_reqwest', { resource, init }).then((r: any) => new FetchReqwestResponse(r))
}
export const fetchMethod = DESKTOP_BUILD ? fetchReqwest : window.fetch

class FetchReqwestResponseHeaders {
  headers: Record<string, string>

  constructor (headers: Record<string, string>) {
    this.headers = headers
  }

  get (header: string) {
    return this.headers[header].length === 1 ? this.headers[header][0] : this.headers[header]
  }
}

type Response = {
  headers: Record<string, string>,
  ok: boolean,
  status: number,
  status_text: string,
  text: string
}

class FetchReqwestResponse {
  headers: FetchReqwestResponseHeaders
  ok: boolean
  status: number
  statusText: string
  body: string

  constructor (response: Response) {
    this.headers = new FetchReqwestResponseHeaders(response.headers)
    this.ok = response.ok
    this.status = response.status
    this.statusText = response.status_text
    this.body = response.text
    console.log(response)
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
