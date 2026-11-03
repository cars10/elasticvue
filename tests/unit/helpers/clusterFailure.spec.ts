import { afterEach, describe, expect, it, vi } from 'vitest'
import { describeFailure } from '../../../src/helpers/clusterFailure'
import { EsApiError, EsNetworkError } from '../../../src/services/errors'

const URI = 'https://localhost:9200'

describe('describeFailure', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('detects CORS when the cluster answers requests without CORS', async () => {
    const probe = vi.fn().mockResolvedValue({ type: 'opaque' })
    vi.stubGlobal('fetch', probe)

    expect(await describeFailure(new EsNetworkError(new TypeError('Failed to fetch')), URI)).toEqual({
      status: 0,
      message: 'Failed to fetch',
      cors: true
    })
    expect(probe).toHaveBeenCalledWith(URI, expect.objectContaining({ mode: 'no-cors', credentials: 'omit' }))
  })

  it('reports offline or untrusted clusters when the probe fails too', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    expect(await describeFailure(new EsNetworkError(new TypeError('Failed to fetch')), URI)).toEqual({
      status: 0,
      message: 'Failed to fetch',
      cors: false
    })
  })

  it('does not probe when the cluster answered', async () => {
    const probe = vi.fn()
    vi.stubGlobal('fetch', probe)

    const error = new EsApiError(401, 'Unauthorized', { error: { reason: 'missing authentication credentials' } })
    expect(await describeFailure(error, URI)).toEqual({
      status: 401,
      message: '401 Unauthorized: missing authentication credentials'
    })
    expect(await describeFailure(new EsApiError(500, '', 'plain text'), URI)).toEqual({ status: 500, message: '500' })
    expect(await describeFailure(new EsApiError(400, '', { error: 'bad request' }), URI)).toEqual({
      status: 400,
      message: '400: bad request'
    })
    expect(probe).not.toHaveBeenCalled()
  })

  it('does not probe for other errors', async () => {
    const probe = vi.fn()
    vi.stubGlobal('fetch', probe)

    expect(await describeFailure(new SyntaxError('Unexpected token'), URI)).toEqual({ status: 0, message: 'Unexpected token' })
    expect(probe).not.toHaveBeenCalled()
  })
})
