export class EsApiError extends Error {
  status: number
  statusText: string
  body: unknown

  constructor(status: number, statusText: string, body: unknown) {
    super(`${status} ${statusText}`.trim())
    this.name = 'EsApiError'
    this.status = status
    this.statusText = statusText
    this.body = body
  }
}

export class EsAbortError extends Error {
  constructor() {
    super('Request aborted')
    this.name = 'EsAbortError'
  }
}

export const isAbortError = (error: unknown) =>
  typeof error === 'object' && error !== null && (error as { name?: string }).name === 'AbortError'

export class EsNetworkError extends Error {
  constructor(cause: unknown) {
    super(cause instanceof Error ? cause.message : String(cause))
    this.name = 'EsNetworkError'
  }
}
