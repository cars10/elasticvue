import { test, expect } from '@playwright/test'
import {
  cell,
  chips,
  headers,
  lastSearch,
  nextPage,
  openSearch,
  queryInput,
  rows,
  search,
  setTargets,
  setupSearch,
  toggleColumn
} from '../../helpers/search'

test.describe.configure({ mode: 'parallel' })

test.describe('Search edge cases', () => {
  test('renders objects, arrays, null, booleans, zero and empty objects as distinct values', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)
    await setTargets(page, ['weird'])

    await expect(headers(page)).toContainText(['id.a', 'id.b', 'flat.key', 'with space', 'ümlaut', 'items', 'empty'])
    expect(await cell(page, 'w1', 'id.a')).toBe('1')
    expect(await cell(page, 'w1', 'id.b')).toBe('two')
    expect(await cell(page, 'w1', 'flat.key')).toBe('dotted')
    expect(await cell(page, 'w1', 'with space')).toBe('spaced')
    expect(await cell(page, 'w1', 'ümlaut')).toBe('grün')
    expect(await cell(page, 'w1', 'items')).toBe('[{"k":1},{"k":2}]')
    expect(await cell(page, 'w1', 'empty')).toBe('{}')
    expect(await cell(page, 'w1', 'nothing')).toBe('null')
    expect(await cell(page, 'w1', 'flag')).toBe('false')
    expect(await cell(page, 'w1', 'zero')).toBe('0')
    expect(await cell(page, 'w1', 'tags')).toBe('["a, b","c"]')
  })

  test('truncates long values to the configured length', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)
    await setTargets(page, ['weird'])
    await expect(page.getByTestId('search-result')).toHaveCount(3)

    const value = await cell(page, 'w1', 'long')
    expect(value!.length).toBeLessThanOrEqual(203)
    expect(value!.startsWith('xxxx')).toBe(true)
  })

  test('formats date fields including epoch millis and can show raw values', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)
    await setTargets(page, ['weird'])
    await toggleColumn(page, 'ts')

    const localized = await cell(page, 'w1', 'ts')
    expect(localized).not.toBe('1705312800000')
    expect(localized).toMatch(/2024/)
    expect(await cell(page, 'w1', 'zero')).toBe('0')

    await page.locator('#settings').click()
    await page.getByText('Format date fields in search results').click()
    await page.locator('#search').click()
    await expect(rows(page).first()).toBeVisible()
    expect(await cell(page, 'w1', 'ts')).toBe('1705312800000')
  })

  test('shows hits that only have fields instead of _source', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)
    await setTargets(page, ['weird'])
    await expect(page.getByTestId('search-result')).toHaveCount(3)

    expect(await cell(page, 'f1', 'with space')).toBe('["from fields"]')
    expect(await cell(page, 'f1', '_id')).toBe('f1')
  })

  test('selects and sorts fields with spaces, dots and unicode in their names', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)
    await setTargets(page, ['weird'])

    await headers(page)
      .filter({ hasText: /^with space/ })
      .click()
    await expect
      .poll(() => lastSearch(requests).body.sort)
      .toEqual([{ 'with space': { order: 'asc', unmapped_type: 'keyword' } }])

    await headers(page)
      .filter({ hasText: /^ümlaut/ })
      .click()
    await expect.poll(() => lastSearch(requests).body.sort).toEqual([{ ümlaut: { order: 'asc', unmapped_type: 'keyword' } }])

    await expect(headers(page).filter({ hasText: /^items/ })).not.toHaveClass(/sortable/)
    await expect(headers(page).filter({ hasText: /^long/ })).not.toHaveClass(/sortable/)
  })

  test('edits and deletes documents with routing and slashes in their id', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)
    await setTargets(page, ['weird'])

    const row = rows(page).filter({ hasText: 'a/b' })
    await row.dblclick()
    await expect(page.locator('.q-dialog').getByText('weird / _doc / a/b')).toBeVisible()
    await expect
      .poll(() => requests.find((r) => r.method === 'GET' && r.rawPath.startsWith('/weird/_doc/'))?.rawPath)
      .toBe('/weird/_doc/a%2Fb?routing=rk')
    await page.locator('.q-dialog').getByRole('button').filter({ hasText: 'close' }).first().click()
    await expect(page.locator('.q-dialog')).toHaveCount(0)

    page.once('dialog', (dialog) => dialog.accept())
    await row.locator('td').last().scrollIntoViewIfNeeded()
    await row.getByTestId('search-result-delete').click()
    await expect
      .poll(() => requests.find((r) => r.method === 'DELETE')?.rawPath)
      .toBe('/weird/_doc/a%2Fb?refresh=true&routing=rk')
  })

  test('encodes special characters and date math in index names', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)

    await setTargets(page, ['odd%index'])
    await expect(rows(page)).toHaveCount(1)
    expect(lastSearch(requests).rawPath).toBe('/odd%25index/_search')

    await setTargets(page, ['<weird-{now/d}>'])
    await expect(rows(page)).toHaveCount(3)
    expect(lastSearch(requests).rawPath).toBe('/%3Cweird-%7Bnow%2Fd%7D%3E/_search')
  })

  test('shows elasticsearch errors and recovers when the query is fixed', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)

    await setTargets(page, ['broken'])
    await expect(page.getByText('search_phase_execution_exception')).toBeVisible()
    await expect(rows(page)).toHaveCount(0)

    await setTargets(page, ['movies'])
    await expect(rows(page)).toHaveCount(10)
  })

  test('does not claim there are no results while a search is loading', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)

    await setTargets(page, ['slow'])
    await expect(page.locator('.q-linear-progress').first()).toBeVisible()
    await expect(page.getByTestId('search-no-results')).toHaveCount(0)
    await expect(page.getByTestId('search-no-results')).toBeVisible({ timeout: 5000 })
  })

  test('keeps a manual multi sort in DSL mode while paginating', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)
    await page.getByTestId('search-mode').getByText('DSL').click()

    await page.getByTestId('search-dsl').locator('.cm-content').click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.insertText(
      '{"query": {"match_all": {}}, "size": 10, "sort": [{"year": {"order": "desc"}}, {"_index": {"order": "asc"}}]}'
    )
    await page.getByTestId('search-submit').click()
    await nextPage(page).click()

    await expect.poll(() => lastSearch(requests).body.from).toBe(10)
    expect(lastSearch(requests).body.sort).toEqual([{ year: { order: 'desc' } }, { _index: { order: 'asc' } }])
  })

  test('toggles sort direction in DSL mode and resets sorting when indices change', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)

    await headers(page).filter({ hasText: /^year/ }).click()
    await page.getByTestId('search-mode').getByText('DSL').click()
    await headers(page).filter({ hasText: /^year/ }).click()
    await expect.poll(() => lastSearch(requests).body.sort).toEqual([{ year: { order: 'desc' } }])
    await headers(page).filter({ hasText: /^year/ }).click()
    await expect.poll(() => lastSearch(requests).body.sort).toEqual([])

    page.once('dialog', (dialog) => dialog.accept())
    await page.getByTestId('search-mode').getByText('Query').click()
    await headers(page).filter({ hasText: /^year/ }).click()
    await expect.poll(() => lastSearch(requests).body.sort?.length).toBe(1)

    await setTargets(page, ['movies'])
    await expect.poll(() => lastSearch(requests).body.sort).toEqual([])
    await expect.poll(() => lastSearch(requests).body.from).toBe(0)
  })

  test('keeps indices, query, columns and page size after reloading the page', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)

    await setTargets(page, ['movies'])
    await search(page, 'title:Alien')
    await toggleColumn(page, 'year')
    await page.locator('.q-table__bottom .q-select').click()
    await page.getByRole('option', { name: '20' }).click()

    await page.locator('#nodes').click()
    await page.locator('#search').click()
    await expect(chips(page)).toHaveText(['movies'])
    await expect(queryInput(page)).toHaveValue('title:Alien')
    await expect(headers(page)).not.toContainText(['year'])
    await expect(page.locator('.q-table__bottom')).toContainText('20')
  })

  test('asks for confirmation before showing 1000 rows per page', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)

    await page.locator('.q-table__bottom .q-select').click()
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('option', { name: '1000' }).locator('.q-toggle').click()
    await page.getByRole('option', { name: '1000' }).getByText('1000', { exact: true }).click()

    await expect.poll(() => lastSearch(requests).body.size).toBe(1000)
    await expect(page.locator('.table--sticky-header')).toBeVisible()
  })

  test('opens search for a single index from the indices page', async ({ page }) => {
    const requests = await setupSearch(page)
    await page.locator('#indices').click()
    await page.getByTestId('indices-table').getByText('movies', { exact: true }).first().click()

    await expect(chips(page)).toHaveText(['movies'])
    await expect(rows(page)).toHaveCount(10)
    expect(lastSearch(requests).path).toBe('/movies/_search')
  })

  test('shows query string examples', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)

    await page.getByText('Search examples').click()
    await expect(page.getByText('first_name:(John OR Pete)')).toBeVisible()
  })

  test('toggles the sticky table header', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)

    await page.getByTestId('search-table-settings').click()
    await page.getByText('Sticky table header').click()
    await expect(page.locator('.table--sticky-header')).toBeVisible()
  })

  test('ignores a slow response that arrives after a newer search', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)

    await setTargets(page, ['slow'])
    await setTargets(page, ['recipes'])
    await expect(rows(page)).toHaveCount(2)
    await page.waitForTimeout(2000)
    await expect(rows(page)).toHaveCount(2)
  })

  test('does not carry a large DSL size over to the query mode', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)
    await page.getByTestId('search-mode').getByText('DSL').click()
    expect(new URL(page.url()).search).toBe('')

    const editor = page.getByTestId('search-dsl').locator('.cm-content')
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.insertText('{"query": {"match_all": {}}, "size": 5000}')
    await page.getByTestId('search-submit').click()
    await expect.poll(() => lastSearch(requests).body.size).toBe(5000)
    expect(new URL(page.url()).search).toBe('')

    page.once('dialog', (dialog) => dialog.accept())
    await page.getByTestId('search-mode').getByText('Query').click()
    await expect.poll(() => lastSearch(requests).body.size).toBe(10)
  })
})
