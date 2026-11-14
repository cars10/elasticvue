import { EsApiError, EsNetworkError } from '../services/errors.ts'
import { buildConfig } from '../buildConfig.ts'

export type ClusterFailure = { status: number; message: string; cors?: boolean }

const PROBE_TIMEOUT = 5000

const reachableWithoutCors = async (uri: string) => {
  try {
    await fetch(uri, { mode: 'no-cors', credentials: 'omit', signal: AbortSignal.timeout(PROBE_TIMEOUT) })
    return true
  } catch (_e) {
    return false
  }
}

export const describeFailure = async (error: unknown, uri: string): Promise<ClusterFailure> => {
  if (error instanceof EsApiError) {
    const body = error.body as { error?: string | { reason?: string } } | string | undefined
    const reason = typeof body === 'object' && (typeof body.error === 'string' ? body.error : body.error?.reason)
    return { status: error.status, message: reason ? `${error.message}: ${reason}` : error.message }
  }

  const message = error instanceof Error ? error.message : String(error)
  if (!(error instanceof EsNetworkError) || !buildConfig.hints.cors) return { status: 0, message }

  return { status: 0, message, cors: await reachableWithoutCors(uri) }
}
