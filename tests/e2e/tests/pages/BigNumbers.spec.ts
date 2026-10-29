import { readFile } from 'node:fs/promises'
import { test, expect, Page, Route } from '@playwright/test'
import { cell, headers, openSearch, rows, setupSearch } from '../../helpers/search'

test.describe.configure({ mode: 'parallel' })

const BIG = '74897271582524117'
const UNSAFE = '9007199254740993'
const ULONG_MAX = '18446744073709551615'

// Raw JSON text: JSON.stringify could not write these values without rounding them
const DOCS: Record<string, string> = {
  b1: `{"id":${BIG},"counter":5,"ratio":83.33333333333334,"constructor":${UNSAFE},"project_constructor":"x","__proto__":{"polluted":true},"nested":{"ids":[${ULONG_MAX},1]}}`,
  b2: `{"id":${UNSAFE},"counter":9007199254740995,"ratio":0.5}`,
  b3: '{"id":10,"counter":-9007199254740993,"ratio":1}'
}
const IDS: Record<string, bigint> = { b1: BigInt(BIG), b2: BigInt(UNSAFE), b3: 10n }

const FIELDS: Record<string, string> = {
  _id: '_id',
  id: 'long',
  counter: 'long',
  ratio: 'double',
  constructor: 'long',
  project_constructor: 'keyword',
  '__proto__.polluted': 'boolean',
  nested: 'object',
  'nested.ids': 'long'
}

type Recorded = { method: string; path: string; raw: string }

const hit = (id: string) => `{"_index":"bignums","_id":"${id}","_score":1,"_source":${DOCS[id]}}`

const mockBigNumbers = async (page: Page) => {
  const requests: Recorded[] = []
  const record = (route: Route) => {
    const request = route.request()
    requests.push({ method: request.method(), path: new URL(request.url()).pathname, raw: request.postData() ?? '' })
  }
  const fulfill = (route: Route, body: string) => route.fulfill({ contentType: 'application/json', body })

  await page.route(/localhost:9200\/[^/]+\/_field_caps/, (route) => {
    record(route)
    const fields = Object.fromEntries(
      Object.entries(FIELDS).map(([name, type]) => [name, { [type]: { type, searchable: true, aggregatable: true } }])
    )
    route.fulfill({ json: { indices: ['bignums'], fields } })
  })

  await page.route(/localhost:9200\/[^/]+\/_search/, (route) => {
    record(route)
    const body = route.request().postDataJSON() ?? {}
    if (body.size === 0) return fulfill(route, '{"hits":{"total":{"value":3,"relation":"eq"},"hits":[]}}')

    const order = body.sort?.[0]?.id?.order
    const ids = Object.keys(DOCS)
    if (order) ids.sort((a, b) => (IDS[a] < IDS[b] ? -1 : 1) * (order === 'desc' ? -1 : 1))
    fulfill(route, `{"took":1,"hits":{"total":{"value":3,"relation":"eq"},"hits":[${ids.map(hit).join(',')}]}}`)
  })

  await page.route(/localhost:9200\/bignums\/_doc\//, (route) => {
    record(route)
    if (route.request().method() !== 'GET') return route.fulfill({ json: { result: 'updated' } })
    fulfill(route, `{"_index":"bignums","_id":"b1","_version":1,"_seq_no":1,"_primary_term":1,"found":true,"_source":${DOCS.b1}}`)
  })

  await page.route(/localhost:9200\/_sql(\?|$)/, (route) => {
    record(route)
    fulfill(
      route,
      `{"columns":[{"name":"name","type":"keyword"},{"name":"id","type":"long"}],"rows":[["a",${BIG}],["b",5],["c",${UNSAFE}],["d",-${UNSAFE}],["e",10]]}`
    )
  })

  return requests
}

const pageErrors: string[] = []

test.beforeEach(({ page }) => {
  pageErrors.length = 0
  page.on('pageerror', (error) => pageErrors.push(error.message))
})

test.afterEach(() => expect(pageErrors).toEqual([]))

const setup = async (page: Page) => {
  await setupSearch(page)
  const requests = await mockBigNumbers(page)
  await openSearch(page)
  await expect(rows(page)).toHaveCount(3)
  return requests
}

const panel = (page: Page) => page.getByTestId('search-document-panel')
const lastSearchRaw = (requests: Recorded[]) => requests.filter((r) => r.path.endsWith('/_search')).at(-1)?.raw ?? ''
const columnValues = (page: Page, column: string) => Promise.all(['b1', 'b2', 'b3'].map((id) => cell(page, id, column)))
const rowIds = (page: Page) => rows(page).locator('td').filter({ hasText: /^b\d$/ }).allTextContents()

test.describe('Big numbers', () => {
  test('shows big integers exactly in the table, the summary and the document panel', async ({ page }) => {
    await setup(page)

    expect(await columnValues(page, 'id')).toEqual([BIG, UNSAFE, '10'])
    expect(await columnValues(page, 'counter')).toEqual(['5', '9007199254740995', '-9007199254740993'])
    expect(await columnValues(page, 'ratio')).toEqual(['83.33333333333334', '0.5', '1'])
    expect(await cell(page, 'b1', 'nested.ids')).toBe(`[${ULONG_MAX},1]`)
    expect(await cell(page, 'b1', 'constructor')).toBe(UNSAFE)
    expect(await cell(page, 'b1', 'project_constructor')).toBe('x')
    expect(await page.evaluate(() => ({}) as Record<string, unknown>)).not.toHaveProperty('polluted')

    await rows(page).filter({ hasText: 'b1' }).locator('td').nth(3).click()
    const field = (name: string) =>
      panel(page)
        .getByTestId('search-panel-field')
        .filter({ hasText: new RegExp(`^${name}`) })
    await expect(field('id')).toContainText(BIG)
    await expect(field('nested.ids')).toContainText(ULONG_MAX)
    await expect(field('constructor')).toContainText(UNSAFE)
    await expect(field('__proto__.polluted')).toContainText('true')

    await panel(page).getByTestId('search-panel-tab-json').click()
    await expect(panel(page)).toContainText(`"id": ${BIG}`)
    await expect(panel(page)).toContainText(`"ratio": 83.33333333333334`)
    await expect(panel(page)).toContainText(ULONG_MAX)
  })

  test('sorts by a long field and keeps big values in order', async ({ page }) => {
    const requests = await setup(page)

    await headers(page).filter({ hasText: /^id/ }).click()
    await expect.poll(() => JSON.parse(lastSearchRaw(requests)).sort).toEqual([{ id: { order: 'asc', unmapped_type: 'long' } }])
    await expect.poll(() => rowIds(page)).toEqual(['b3', 'b2', 'b1'])
    expect(await columnValues(page, 'id')).toEqual([BIG, UNSAFE, '10'])

    await headers(page).filter({ hasText: /^id/ }).click()
    await expect.poll(() => rowIds(page)).toEqual(['b1', 'b2', 'b3'])
  })

  test('filters by big values without losing precision', async ({ page }) => {
    const requests = await setup(page)

    await rows(page).filter({ hasText: 'b1' }).locator('td').nth(3).click()
    await panel(page).getByTestId('search-panel-field').filter({ hasText: /^id/ }).getByTestId('search-panel-filter-for').click()

    await expect(page.getByTestId('search-filter-chip').first()).toContainText(`id: ${BIG}`)
    await expect.poll(() => lastSearchRaw(requests)).toContain(`{"match_phrase":{"id":"${BIG}"}}`)
  })

  test('sends big integers from the DSL editor unchanged', async ({ page }) => {
    const requests = await setup(page)

    await page.getByTestId('search-mode').getByText('DSL').click()
    const editor = page.getByTestId('search-dsl').locator('.cm-content')
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.insertText(`{"query": {"terms": {"id": [${BIG}, ${ULONG_MAX}]}}, "size": 5, "track_total_hits": true}`)
    await page.keyboard.press('Control+Enter')

    await expect.poll(() => lastSearchRaw(requests)).toContain(`"terms":{"id":[${BIG},${ULONG_MAX}]}`)
    expect(await columnValues(page, 'id')).toEqual([BIG, UNSAFE, '10'])
  })

  test('edits documents with big integers without losing precision', async ({ page }) => {
    const requests = await setup(page)

    await rows(page).filter({ hasText: 'b1' }).locator('td').nth(3).dblclick()
    const dialog = page.locator('.q-dialog')
    await expect(dialog.locator('.cm-content')).toContainText(`"id": ${BIG}`)
    await expect(dialog.locator('.cm-content')).toContainText(ULONG_MAX)

    await dialog.getByRole('button', { name: 'Update' }).click()
    await expect
      .poll(() => requests.find((r) => r.method !== 'GET' && r.path.startsWith('/bignums/_doc/'))?.raw)
      .toContain(`"id":${BIG}`)
    const saved = requests.find((r) => r.method !== 'GET' && r.path.startsWith('/bignums/_doc/'))!.raw
    expect(saved).toContain(ULONG_MAX)
    expect(saved).toContain('"ratio":83.33333333333334')
    expect(saved).toContain('"project_constructor":"x"')
  })

  test('downloads big integers exactly as csv and json', async ({ page }) => {
    await setup(page)

    const download = async (type: 'csv' | 'json') => {
      const event = page.waitForEvent('download')
      await page.getByTestId('search-download').click()
      await page.getByTestId(`search-download-${type}`).click()
      return readFile((await (await event).path())!, 'utf8')
    }

    const csv = await download('csv')
    expect(csv).toContain(BIG)
    expect(csv).toContain(`[${ULONG_MAX},1]`)

    const json = await download('json')
    expect(json).toContain(`"id":${BIG}`)
    expect(json).toContain(`"ids":[${ULONG_MAX},1]`)
  })

  test('sorts sql results with big integers numerically', async ({ page }) => {
    await setup(page)

    await page.getByTestId('search-mode').getByText('SQL', { exact: true }).click()
    const table = page.getByTestId('search-sql-results')
    const ids = () => table.locator('tbody tr').evaluateAll((trs) => trs.map((tr) => tr.children[1].textContent?.trim()))
    await expect.poll(ids).toEqual([BIG, '5', UNSAFE, `-${UNSAFE}`, '10'])

    await table.locator('thead th').filter({ hasText: 'id' }).click()
    await expect.poll(ids).toEqual([`-${UNSAFE}`, '5', '10', UNSAFE, BIG])

    await table.locator('thead th').filter({ hasText: 'id' }).click()
    await expect.poll(ids).toEqual([BIG, UNSAFE, '10', '5', `-${UNSAFE}`])
  })

  test('shows big integers unchanged in REST responses', async ({ page }) => {
    await setup(page)

    await page.locator('#rest').click()
    await page.getByTestId('rest-path').fill('bignums/_search')
    await page.getByTestId('rest-path').press('Enter')

    const response = page.getByTestId('rest-response-body').locator('.cm-content')
    await expect(response).toContainText(`"id": ${BIG}`)
    await expect(response).toContainText(ULONG_MAX)
    await expect(response).toContainText('"ratio": 83.33333333333334')
  })
})
