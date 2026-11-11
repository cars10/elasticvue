import { invoke } from '@tauri-apps/api/core'
import { buildConfig } from '../buildConfig.ts'
import { parseJson } from './json/parse.ts'

const rejectOnAbort = (signal: AbortSignal) =>
  new Promise<never>((_resolve, reject) => {
    if (signal.aborted) return reject(signal.reason)
    signal.addEventListener('abort', () => reject(signal.reason), { once: true })
  })

export const fetchReqwest = async (resource: any, { signal, ...init }: any = {}) => {
  const request: Promise<Response> = invoke('fetch_reqwest', { resource, init })
  const r = await (signal ? Promise.race([request, rejectOnAbort(signal)]) : request)
  return new FetchReqwestResponse(r)
}
export type FetchResponse = {
  ok: boolean
  status: number
  statusText: string
  headers: { get(name: string): string | null }
  text(): Promise<string>
}

export const fetchMethod: (input: URL | string, init?: RequestInit) => Promise<FetchResponse> = buildConfig.tauri
  ? fetchReqwest
  : window.fetch

class FetchReqwestResponseHeaders {
  headers: Record<string, string>

  constructor(headers: Record<string, string>) {
    this.headers = headers
  }

  get(header: string) {
    const value = this.headers[header]
    if (!value) return null
    return value.length === 1 ? value[0] : value
  }
}

type Response = {
  headers: Record<string, string>
  ok: boolean
  status: number
  status_text: string
  text: string
}

class FetchReqwestResponse {
  headers: FetchReqwestResponseHeaders
  ok: boolean
  status: number
  statusText: string
  body: string

  constructor(response: Response) {
    this.headers = new FetchReqwestResponseHeaders(response.headers)
    this.ok = response.ok
    this.status = response.status
    this.statusText = response.status_text
    this.body = response.text
  }

  text() {
    return Promise.resolve(this.body)
  }

  json() {
    try {
      return Promise.resolve(parseJson(this.body))
    } catch (e) {
      return Promise.reject(e)
    }
  }
}
