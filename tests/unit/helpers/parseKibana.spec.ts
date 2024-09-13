import { describe, it, expect } from 'vitest'
import { parseKibana } from '../../../src/helpers/parseKibana'

describe.concurrent('parseKibana.ts', () => {
  describe.concurrent('plain requests', () => {
    it('accepts ""', () => {
        const input = ''
        const request = parseKibana(input)
        expect(request.method).toEqual(null)
        expect(request.path).toEqual(null)
        expect(request.body).toEqual(input)
    })

    it('accepts "{"query": "*"}"', () => {
        const input = '{"query": "*"}'
        const request = parseKibana(input)
        expect(request.method).toEqual(null)
        expect(request.path).toEqual(null)
        expect(request.body).toEqual(input)
    })

    it('accepts "{\n\t"query": "*"\n}\n"', () => {
        const input = '{\n\t"query": "*"\n}\n'
        const request = parseKibana(input)
        expect(request.method).toEqual(null)
        expect(request.path).toEqual(null)
        expect(request.body).toEqual(input)
    })
  })

  describe.concurrent('kibana single line request', () => {
    it('accepts "GET"', () => {
        const input = 'GET'
        const request = parseKibana(input)
        expect(request.method).toEqual('GET')
        expect(request.path).toEqual('')
        expect(request.body).toEqual('')
    })

    it('accepts "GET "', () => {
        const input = 'GET '
        const request = parseKibana(input)
        expect(request.method).toEqual('GET')
        expect(request.path).toEqual('')
        expect(request.body).toEqual('')
    })

    it('accepts "GET    "', () => {
        const input = 'GET    '
        const request = parseKibana(input)
        expect(request.method).toEqual('GET')
        expect(request.path).toEqual('')
        expect(request.body).toEqual('')
    })

    it('accepts "GET /"', () => {
        const input = 'GET /'
        const request = parseKibana(input)
        expect(request.method).toEqual('GET')
        expect(request.path).toEqual('/')
        expect(request.body).toEqual('')
    })

    it('accepts "GET _cat/foo"', () => {
        const input = 'GET _cat/foo'
        const request = parseKibana(input)
        expect(request.method).toEqual('GET')
        expect(request.path).toEqual('_cat/foo')
        expect(request.body).toEqual('')
    })

    it('accepts "POST _search?query=foobar"', () => {
        const input = 'POST _search?query=foobar'
        const request = parseKibana(input)
        expect(request.method).toEqual('POST')
        expect(request.path).toEqual('_search?query=foobar')
        expect(request.body).toEqual('')
    })
  })

  describe.concurrent('kibana multiline request', () => {
    it('accepts "POST /_search\n{\n\t"query": {\n\t\t"query_string": {\n\t\t\t"query": "*"\n\t\t}\n\t}\n}"', () => {
        const input = 'POST /_search\n{\n\t"query": {\n\t\t"query_string": {\n\t\t\t"query": "*"\n\t\t}\n\t}\n}'
        const request = parseKibana(input)
        expect(request.method).toEqual('POST')
        expect(request.path).toEqual('/_search')
        expect(request.body).toEqual('{\n\t"query": {\n\t\t"query_string": {\n\t\t\t"query": "*"\n\t\t}\n\t}\n}')
    })
  })
})
