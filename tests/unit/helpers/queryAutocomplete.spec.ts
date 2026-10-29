import { describe, expect, it } from 'vitest'
import {
  applySuggestion,
  escapeQueryField,
  queryToken,
  querySuggestions,
  quoteQueryValue,
  recentQuerySuggestions
} from '../../../src/helpers/search/queryAutocomplete'
import { toCsv } from '../../../src/helpers/search/documentValues'
import { filterLabel, isCompleteFilter, parseFilters } from '../../../src/helpers/search/filters'

const at = (text: string) => queryToken(text.replace('|', ''), text.indexOf('|'))

describe('queryToken', () => {
  it('finds the term at the caret', () => {
    expect(at('tit|')).toEqual({ start: 0, end: 3, prefix: '', field: null, value: 'tit' })
    expect(at('a AND (ti|tle')).toMatchObject({ start: 7, end: 12, value: 'ti' })
    expect(at('a |')).toMatchObject({ start: 2, value: '' })
  })

  it('splits field and value, keeps the negation prefix', () => {
    expect(at('-level:err|')).toMatchObject({ prefix: '-', field: 'level', value: 'err' })
    expect(at('name:"New Yo|')).toMatchObject({ start: 0, field: 'name', value: 'New Yo' })
    expect(at('with\\ space:x|')).toMatchObject({ field: 'with space', value: 'x' })
    expect(at('url:http\\://|')).toMatchObject({ field: 'url', value: 'http://' })
  })
})

describe('querySuggestions', () => {
  const fields = ['title', 'title.keyword', 'subtitle', 'with space', 'ordered']

  it('ranks fields starting with the term first and adds operators', () => {
    expect(querySuggestions(at('tit|'), fields, []).map((s) => s.label)).toEqual(['title', 'title.keyword', 'subtitle'])
    expect(querySuggestions(at('a o|'), ['ordered', 'title'], []).map((s) => s.label)).toEqual(['ordered', 'OR'])
    expect(querySuggestions(at('a |'), fields, [])).toEqual([])
  })

  it('escapes field names and quotes values', () => {
    expect(querySuggestions(at('with|'), fields, [])[0].insert).toBe('with\\ space:')
    expect(querySuggestions(at('-city:new|'), fields, ['New York', 'Newark']).map((s) => s.insert)).toEqual([
      '-city:"New York" ',
      '-city:Newark '
    ])
  })

  it('applies a suggestion in place of the term', () => {
    const token = at('a AND tit| b')
    expect(applySuggestion('a AND tit b', token, 'title:')).toEqual({ text: 'a AND title: b', caret: 12 })
    expect(applySuggestion('a AND tit b', token, 'title:x ')).toEqual({ text: 'a AND title:x b', caret: 14 })
  })
})

describe('recentQuerySuggestions', () => {
  it('suggests matching recent queries once', () => {
    const recent = ['level:error', 'title:Alien', 'level:error', 'level:warn']
    expect(recentQuerySuggestions('level', recent).map((s) => s.insert)).toEqual(['level:error', 'level:warn'])
    expect(recentQuerySuggestions('level:error', recent)).toEqual([])
    expect(recentQuerySuggestions('*', recent)).toEqual([])
  })
})

describe('query escaping', () => {
  it('escapes lucene syntax', () => {
    expect(escapeQueryField('a.b')).toBe('a.b')
    expect(escapeQueryField('a-b c')).toBe('a\\-b\\ c')
    expect(quoteQueryValue('ümlaut_1.0')).toBe('ümlaut_1.0')
    expect(quoteQueryValue('say "hi"')).toBe('"say \\"hi\\""')
  })
})

describe('toCsv', () => {
  it('quotes cells with commas, quotes and newlines', () => {
    expect(
      toCsv([
        ['a', 'b'],
        ['x, y', 'say "hi"'],
        ['line\nbreak', '{"k":1}']
      ])
    ).toBe('a,b\r\n"x, y","say ""hi"""\r\n"line\nbreak","{""k"":1}"')
  })
})

describe('filters', () => {
  it('labels filters', () => {
    expect(filterLabel({ field: 'level', op: 'is', value: 'error' })).toBe('level: error')
    expect(filterLabel({ field: 'level', op: 'is', value: 'error', negate: true })).toBe('NOT level: error')
    expect(filterLabel({ field: 'user', op: 'exists' })).toBe('user exists')
    expect(filterLabel({ field: 'bytes', op: 'between', value: '10' })).toBe('bytes: 10 – …')
  })

  it('parses filters from the url and drops invalid ones', () => {
    const valid = [
      { field: 'level', op: 'is', value: 'error', negate: true },
      { field: 'user', op: 'exists', disabled: true }
    ]
    expect(parseFilters(JSON.stringify(valid))).toEqual(valid)
    expect(
      parseFilters(JSON.stringify([{ field: 'a', op: 'script', value: 'x' }, { field: 'b', op: 'is', value: 1 }, null, 'x']))
    ).toEqual([])
    expect(parseFilters('{"field":"a"}')).toEqual([])
    expect(parseFilters('not json')).toEqual([])
  })

  it('knows when a filter is complete', () => {
    expect(isCompleteFilter({ field: '', op: 'exists' })).toBe(false)
    expect(isCompleteFilter({ field: 'a', op: 'is', value: '' })).toBe(false)
    expect(isCompleteFilter({ field: 'a', op: 'between', to: '5' })).toBe(true)
  })
})
