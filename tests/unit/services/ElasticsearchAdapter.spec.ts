import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMethod = vi.fn()
vi.mock('../../../src/helpers/fetch', () => ({ fetchMethod: (...args: unknown[]) => fetchMethod(...args) }))

import ElasticsearchAdapter from '../../../src/services/ElasticsearchAdapter'
import { EsAbortError, EsApiError, EsNetworkError } from '../../../src/services/errors'
import { AuthType } from '../../../src/store/connection'

const respond = (status: number, body: string, contentType = 'application/json') => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 200 ? 'OK' : 'Bad Request',
  headers: { get: (name: string) => (name === 'content-type' ? contentType : null) },
  text: () => Promise.resolve(body)
})

const adapter = () =>
  new ElasticsearchAdapter({ name: 'test', uri: 'http://localhost:9200', auth: { authType: AuthType.none, authData: {} } })

describe('ElasticsearchAdapter.request', () => {
  beforeEach(() => {
    fetchMethod.mockReset()
  })

  it('parses json bodies', async () => {
    fetchMethod.mockResolvedValue(respond(200, '{"status":"green","big":12345678901234567890}'))

    const body = await adapter().clusterHealth()

    expect(body.status).toBe('green')
    expect(String(body.big)).toBe('12345678901234567890')
  })

  it('returns true for non json bodies', async () => {
    fetchMethod.mockResolvedValue(respond(200, '', 'text/plain'))

    expect(await adapter().indexRefresh({ indices: ['a'] })).toBe(true)
  })

  it('parses json bodies sent with another content type', async () => {
    fetchMethod.mockResolvedValue(respond(200, '{"status":"green"}', 'text/plain'))

    expect(await adapter().clusterHealth()).toEqual({ status: 'green' })
  })

  it('throws EsApiError with the parsed body on non 2xx', async () => {
    fetchMethod.mockResolvedValue(respond(400, '{"error":{"type":"index_not_found_exception"}}'))

    const error = await adapter()
      .clusterHealth()
      .catch((e) => e)

    expect(error).toBeInstanceOf(EsApiError)
    expect(error.status).toBe(400)
    expect(error.body).toEqual({ error: { type: 'index_not_found_exception' } })
  })

  it('keeps non json error bodies as text', async () => {
    fetchMethod.mockResolvedValue(respond(502, 'Bad Gateway', 'text/html'))

    const error = await adapter()
      .clusterHealth()
      .catch((e) => e)

    expect(error).toBeInstanceOf(EsApiError)
    expect(error.body).toBe('Bad Gateway')
  })

  it('throws EsNetworkError when fetch fails', async () => {
    fetchMethod.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(adapter().clusterHealth()).rejects.toThrow(EsNetworkError)
  })

  it('lists tasks with detailed params and cancels a task by id', async () => {
    fetchMethod.mockResolvedValue(respond(200, '{"nodes":{}}'))

    await adapter().tasks({ detailed: true })
    await adapter().taskCancel({ taskId: 'oTUltX4IQMOUUVeiohTt8A:12345' })

    expect(String(fetchMethod.mock.calls[0][0])).toBe('http://localhost:9200/_tasks?detailed=true')
    expect(fetchMethod.mock.calls[0][1].method).toBe('GET')
    expect(String(fetchMethod.mock.calls[1][0])).toBe('http://localhost:9200/_tasks/oTUltX4IQMOUUVeiohTt8A%3A12345/_cancel')
    expect(fetchMethod.mock.calls[1][1].method).toBe('POST')
  })

  it('splits large index lists into chunks', async () => {
    fetchMethod.mockResolvedValue(respond(200, '{"acknowledged":true}'))
    const indices = Array.from({ length: 20 }, (_, i) => `index-${i}`)

    const result = await adapter().indexDelete({ indices })

    expect(fetchMethod).toHaveBeenCalledTimes(2)
    expect(String(fetchMethod.mock.calls[0][0])).toBe(`http://localhost:9200/${indices.slice(0, 16).join(',')}`)
    expect(String(fetchMethod.mock.calls[1][0])).toBe(`http://localhost:9200/${indices.slice(16).join(',')}`)
    expect(result).toEqual({ acknowledged: true })
  })

  it('stops chunking at the first failing chunk', async () => {
    fetchMethod.mockResolvedValue(respond(400, '{"error":{"type":"x"}}'))
    const indices = Array.from({ length: 40 }, (_, i) => `index-${i}`)

    await expect(adapter().indexDelete({ indices })).rejects.toBeInstanceOf(EsApiError)
    expect(fetchMethod).toHaveBeenCalledTimes(1)
  })

  it('passes the abort signal to fetch only when one is given', async () => {
    fetchMethod.mockResolvedValue(respond(200, '{}'))
    const { signal } = new AbortController()

    await adapter().clusterHealth({ signal })
    await adapter().clusterHealth()

    expect(fetchMethod.mock.calls[0][1].signal).toBe(signal)
    expect('signal' in fetchMethod.mock.calls[1][1]).toBe(false)
  })

  it('throws EsAbortError for aborted requests and EsNetworkError for timeouts', async () => {
    fetchMethod.mockRejectedValueOnce(Object.assign(new Error('aborted'), { name: 'AbortError' }))
    expect(await adapter().ping().catch((e) => e)).toBeInstanceOf(EsAbortError)

    fetchMethod.mockRejectedValueOnce(Object.assign(new Error('signal timed out'), { name: 'TimeoutError' }))
    expect(await adapter().ping().catch((e) => e)).toBeInstanceOf(EsNetworkError)
  })
})
