import { readFile } from 'node:fs/promises'
import { test, expect, Page } from '@playwright/test'
import {
  CLUSTER_UUID,
  lastSearch,
  openSearch,
  queryInput,
  rows,
  setTargets,
  setupSearch,
  toggleColumn,
  valueSearches
} from '../../helpers/search'
import type { SearchBody } from '../../mocks/search'

test.describe.configure({ mode: 'parallel' })

const chips = (page: Page) => page.getByTestId('search-filter-chip')
const panel = (page: Page) => page.getByTestId('search-document-panel')
const suggestions = (page: Page) => page.getByTestId('search-query-suggestion')
const boolQuery = (body: SearchBody) => (body.query as { bool?: Record<string, unknown> }).bool

const addFilter = async (page: Page, field: string, op: string, value?: string) => {
  await page.getByTestId('search-filter-add').click()
  const form = page.getByTestId('search-filter-form')
  await form.getByTestId('search-filter-field').fill(field)
  await page
    .locator('.q-menu .q-item')
    .filter({ hasText: new RegExp(`^${field}$`) })
    .click()
  await form.getByTestId('search-filter-op').getByText(op, { exact: true }).click()
  if (value !== undefined) await form.getByTestId('search-filter-value').fill(value)
  await form.getByTestId('search-filter-save').click()
}

const chipAction = async (page: Page, chip: string, action: string) => {
  await chips(page).filter({ hasText: chip }).click()
  await page.getByTestId(action).click()
  await expect(page.locator('.q-menu')).toHaveCount(0)
}

test.describe('Search filters', () => {
  test('adds, inverts, disables, edits and removes filters', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)

    await addFilter(page, 'director.name', 'is', 'Ridley Scott')
    await expect(chips(page)).toHaveText([/director\.name: Ridley Scott/])
    await expect
      .poll(() => boolQuery(lastSearch(requests).body))
      .toEqual({ filter: [{ match_phrase: { 'director.name': 'Ridley Scott' } }] })

    await page.getByTestId('search-filter-add').click()
    await page.getByTestId('search-filter-field').fill('year')
    await page
      .locator('.q-menu .q-item')
      .filter({ hasText: /^year$/ })
      .click()
    await page.getByTestId('search-filter-op').getByText('between', { exact: true }).click()
    await page.getByTestId('search-filter-from').fill('1980')
    await page.getByTestId('search-filter-save').click()
    await expect(chips(page).nth(1)).toHaveText(/year: 1980 – …/)
    await expect
      .poll(() => boolQuery(lastSearch(requests).body)?.filter)
      .toEqual([{ match_phrase: { 'director.name': 'Ridley Scott' } }, { range: { year: { gte: '1980' } } }])

    await chipAction(page, 'director.name', 'search-filter-invert')
    await expect(chips(page).first()).toHaveText(/NOT director\.name: Ridley Scott/)
    await expect
      .poll(() => boolQuery(lastSearch(requests).body))
      .toEqual({
        filter: [{ range: { year: { gte: '1980' } } }],
        must_not: [{ match_phrase: { 'director.name': 'Ridley Scott' } }]
      })

    await chipAction(page, 'year', 'search-filter-toggle')
    await expect(chips(page).nth(1)).toHaveClass(/text-strike/)
    await expect
      .poll(() => boolQuery(lastSearch(requests).body))
      .toEqual({ must_not: [{ match_phrase: { 'director.name': 'Ridley Scott' } }] })

    await chips(page).filter({ hasText: 'director.name' }).click()
    await page.getByTestId('search-filter-edit').click()
    const editForm = page.getByTestId('search-filter-form')
    await editForm.getByTestId('search-filter-value').fill('Director 2')
    await editForm.getByTestId('search-filter-save').click()
    await expect(chips(page).first()).toHaveText(/NOT director\.name: Director 2/)

    await chips(page).first().locator('.q-chip__icon--remove').click()
    await chips(page).first().locator('.q-chip__icon--remove').click()
    await expect(chips(page)).toHaveCount(0)
    await expect.poll(() => lastSearch(requests).body.query).toEqual({ match_all: {} })
  })

  test('suggests top values of the chosen field', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)

    await page.getByTestId('search-filter-add').click()
    await page.getByTestId('search-filter-field').fill('title')
    await page
      .locator('.q-menu .q-item')
      .filter({ hasText: /^title$/ })
      .click()
    await page.getByTestId('search-filter-value').click()
    await expect(page.locator('.q-menu .q-item').filter({ hasText: /^Alien$/ })).toBeVisible()

    expect(valueSearches(requests).at(-1)!.body.aggs).toEqual({ values: { terms: { field: 'title.keyword', size: 10 } } })
  })

  test('persists filters and seeds them into the DSL editor', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)
    await addFilter(page, 'title', 'exists')
    await expect(chips(page)).toHaveText([/title exists/])
    await expect.poll(() => boolQuery(lastSearch(requests).body)).toEqual({ filter: [{ exists: { field: 'title' } }] })

    const stored = await page.evaluate((uuid) => localStorage.getItem(`search-${uuid}`), CLUSTER_UUID)
    expect(JSON.parse(stored!).filters).toEqual([{ field: 'title', op: 'exists' }])

    await page.getByTestId('search-mode').getByText('DSL').click()
    await expect(page.getByTestId('search-dsl').locator('.cm-content')).toContainText('"exists"')
    await expect(page.getByTestId('search-filters')).toHaveCount(0)
  })
})

test.describe('Search filters in the url', () => {
  test('writes filters to the url and loads valid ones from it', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)
    await addFilter(page, 'title', 'exists')
    await expect.poll(() => new URL(page.url()).searchParams.get('filters')).toBe('[{"field":"title","op":"exists"}]')

    const filters = JSON.stringify([
      { field: 'level', op: 'is', value: 'error', negate: true },
      { field: 'evil', op: 'script', value: 'x' }
    ])
    await page.goto(`http://localhost:5175/cluster/0/search?index=movies&q=*&filters=${encodeURIComponent(filters)}`)

    await expect(chips(page)).toHaveText([/^NOT level: error/])
    await expect.poll(() => boolQuery(lastSearch(requests).body)).toEqual({ must_not: [{ match_phrase: { level: 'error' } }] })
  })
})

test.describe('Search query autocomplete', () => {
  test('completes fields, values and operators with the keyboard', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)

    await queryInput(page).fill('dire')
    await expect(suggestions(page)).toHaveText([/director\.name/])
    await queryInput(page).press('ArrowDown')
    await queryInput(page).press('Enter')
    await expect(queryInput(page)).toHaveValue('director.name:')

    await expect(suggestions(page).first()).toContainText('Ridley Scott')
    await queryInput(page).pressSequentially('Rid')
    await expect(suggestions(page)).toHaveText([/Ridley Scott/])
    await queryInput(page).press('ArrowDown')
    await queryInput(page).press('Tab')
    await expect(queryInput(page)).toHaveValue('director.name:"Ridley Scott" ')

    await queryInput(page).pressSequentially('an')
    await expect(suggestions(page).filter({ hasText: 'AND' })).toBeVisible()
    await queryInput(page).press('Escape')
    await expect(suggestions(page)).toHaveCount(0)
    await expect(queryInput(page)).toHaveValue('director.name:"Ridley Scott" an')

    await queryInput(page).fill('director.name:"Ridley Scott"')
    await queryInput(page).press('Enter')
    await expect
      .poll(() => lastSearch(requests).body.query?.bool?.must?.[0]?.query_string?.query)
      .toBe('director.name:"Ridley Scott"')
  })

  test('escapes field names with spaces', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)
    await setTargets(page, ['weird'])
    await expect(rows(page)).toHaveCount(3)

    await expect(async () => {
      await queryInput(page).fill('with')
      await expect(suggestions(page).first()).toHaveText(/with space/, { timeout: 1000 })
    }).toPass()
    await queryInput(page).press('ArrowDown')
    await queryInput(page).press('Enter')
    await expect(queryInput(page)).toHaveValue('with\\ space:')
  })

  test('resets the query with escape when no suggestions are open', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)
    await queryInput(page).fill('zzz')
    await expect(suggestions(page)).toHaveCount(0)
    await queryInput(page).press('Escape')
    await expect(queryInput(page)).toHaveValue('*')
  })
})

test.describe('Search document panel', () => {
  test('shows fields and json, and adds filters from values', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)

    await rows(page).filter({ hasText: 'Alien' }).locator('td').nth(3).click()
    await expect(panel(page)).toContainText('m1')
    const field = (name: string) => panel(page).getByTestId('search-panel-field').filter({ hasText: name })
    await expect(field('director.name')).toContainText('Ridley Scott')

    await field('director.name').getByTestId('search-panel-filter-for').click()
    await field('year').getByTestId('search-panel-filter-out').click()
    await field('title').getByTestId('search-panel-filter-exists').click()
    await expect(chips(page)).toHaveText([/^director\.name: Ridley Scott/, /^NOT year: 1970/, /^title exists/])
    await expect
      .poll(() => boolQuery(lastSearch(requests).body))
      .toEqual({
        filter: [{ match_phrase: { 'director.name': 'Ridley Scott' } }, { exists: { field: 'title' } }],
        must_not: [{ match_phrase: { year: '1970' } }]
      })

    await panel(page).getByTestId('search-panel-tab-json').click()
    await expect(panel(page)).toContainText('"_index": "movies"')
  })

  test('keeps double click for editing', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)

    await rows(page).first().locator('td').nth(3).dblclick()
    await expect(page.locator('.q-dialog').getByText('movies / _doc / m1')).toBeVisible()
    await expect(panel(page)).toHaveCount(0)
  })

  test('deletes the document and edits documents with slashes and routing', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)
    await setTargets(page, ['weird'])

    await rows(page).filter({ hasText: 'a/b' }).locator('td').nth(2).click()
    await panel(page).getByTestId('search-panel-edit').click()
    await expect(page.locator('.q-dialog').getByText('weird / _doc / a/b')).toBeVisible()
    await expect.poll(() => requests.some((r) => r.method === 'GET' && r.rawPath.includes('a%2Fb?routing=rk'))).toBe(true)
    await page.keyboard.press('Escape')

    page.once('dialog', (dialog) => dialog.accept())
    await panel(page).getByTestId('search-panel-delete').click()
    await expect.poll(() => requests.some((r) => r.method === 'DELETE' && r.rawPath.includes('a%2Fb'))).toBe(true)
    await expect(panel(page)).toHaveCount(0)
  })

  test('shows surrounding documents of a time series document', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)
    await queryInput(page).fill('title:Alien')
    await queryInput(page).press('Enter')

    await rows(page).filter({ hasText: 'Alien' }).locator('td').nth(3).click()
    await panel(page).getByTestId('search-panel-surrounding').click()

    await expect(panel(page)).toHaveCount(0)
    await expect(queryInput(page)).toHaveValue('*')
    await expect
      .poll(() => (boolQuery(lastSearch(requests).body)?.filter as object[])?.[0])
      .toEqual({
        range: {
          '@timestamp': {
            gte: '2024-01-01T09:55:00.000Z',
            lte: '2024-01-01T10:05:00.000Z',
            format: 'strict_date_optional_time||epoch_millis'
          }
        }
      })
    expect(lastSearch(requests).body.sort).toEqual([{ '@timestamp': { order: 'desc', unmapped_type: 'date' } }])
  })
})

test.describe('Search columns and export', () => {
  test('only loads visible fields when enabled and fetches the full document for the panel', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)

    await toggleColumn(page, 'rating')
    await page.getByTestId('search-table-settings').click()
    await page.getByTestId('search-source-only-visible').click()
    await page.keyboard.press('Escape')
    await expect
      .poll(() => (lastSearch(requests).body as { _source?: string[] })._source)
      .toEqual(['title', 'year', 'director.name', '@timestamp'])

    await rows(page).first().locator('td').nth(3).click()
    await expect.poll(() => requests.some((r) => r.method === 'GET' && r.path.startsWith('/movies/_doc/m1'))).toBe(true)
    await expect(panel(page).getByTestId('search-panel-field').filter({ hasText: 'rating' })).toBeVisible()
  })

  test('downloads the visible columns as csv', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)
    await setTargets(page, ['weird'])
    await expect(rows(page)).toHaveCount(3)

    const download = page.waitForEvent('download')
    await page.getByTestId('search-download').click()
    await page.getByTestId('search-download-csv').click()
    const file = await download
    expect(file.suggestedFilename()).toBe('search.csv')

    const csv = await readFile((await file.path())!, 'utf8')
    const [header, ...lines] = csv.split('\r\n')
    expect(header.split(',').slice(0, 2)).toEqual(['_index', '_id'])
    expect(header).toContain('with space')
    expect(lines.find((line) => line.startsWith('weird,w1'))).toContain('"[{""k"":1},{""k"":2}]"')
    expect(lines.find((line) => line.startsWith('weird,w1'))).toContain('"[""a, b"",""c""]"')
    expect(lines.find((line) => line.startsWith('weird,a/b'))).toBeDefined()
  })
})
