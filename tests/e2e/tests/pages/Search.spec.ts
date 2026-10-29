import { test, expect } from '@playwright/test'
import {
  CLUSTER_UUID,
  chips,
  headers,
  lastSearch,
  openSearch,
  queryInput,
  rows,
  setTargets,
  setupSearch as setup,
  targetsInput,
  toggleColumn
} from '../../helpers/search'

test.describe.configure({ mode: 'parallel' })

test.describe('Search', () => {
  test('searches all indices and shows the fields of the documents as default columns', async ({ page }) => {
    const requests = await setup(page)
    await openSearch(page)

    await expect(chips(page)).toHaveText(['*'])
    await expect(page.getByTestId('search-targets-matched')).toContainText('2 indices')
    await expect(page.getByTestId('search-total')).toHaveText('27 hits')
    await expect(page.getByTestId('search-took')).toHaveText('3 ms')
    await expect(headers(page)).toHaveText(['', '_index', '_id', 'title', 'year', 'rating', 'director.name', '@timestamp', ''])
    await expect(rows(page)).toHaveCount(10)
    await expect(rows(page).first()).toContainText('Alien')
    await expect(rows(page).first()).toContainText('Ridley Scott')

    expect(lastSearch(requests)).toMatchObject({
      path: '/*/_search',
      body: { query: { match_all: {} }, from: 0, size: 10, sort: [] }
    })
    expect(lastSearch(requests).body).not.toHaveProperty('track_total_hits')
  })

  test('selects indices, aliases, data streams and patterns with multi-term matching', async ({ page }) => {
    const requests = await setup(page)
    await openSearch(page)

    await targetsInput(page).fill('rec')
    const options = page.locator('.q-menu .q-item')
    await expect(options).toHaveText([/recipes/])

    await targetsInput(page).fill('fo')
    await expect(options.first()).toContainText('food')
    await expect(options.first()).toContainText('alias')

    await targetsInput(page).fill('logs app')
    await expect(options.first()).toContainText('logs-app')
    await expect(options.first()).toContainText('data stream')

    await targetsInput(page).fill('hidden')
    await expect(options).toHaveCount(0)
    await targetsInput(page).fill('.hid')
    await expect(options).toHaveText([/\.hidden-index/])
    await page.keyboard.press('Escape')

    await setTargets(page, ['mov*', 'food'])
    await expect(chips(page)).toHaveText(['mov*', /food$/])
    await expect(page.getByTestId('search-targets-matched')).toContainText('2 indices')
    await expect(page.getByTestId('search-total')).toHaveText('27 hits')
    expect(lastSearch(requests).path).toBe('/food,mov*/_search')
    expect(page.url()).toContain('index=food,mov*')
  })

  test('clears the typed text after picking an index with the keyboard', async ({ page }) => {
    await setup(page)
    await openSearch(page)
    await chips(page).first().locator('.q-chip__icon--remove').click()

    await targetsInput(page).fill('rec')
    await expect(page.locator('.q-menu .q-item')).toHaveText([/recipes/])
    await targetsInput(page).press('ArrowDown')
    await targetsInput(page).press('Enter')

    await expect(chips(page)).toHaveText(['recipes'])
    await expect(targetsInput(page)).toHaveValue('')
  })

  test('shows a warning when no index matches', async ({ page }) => {
    await setup(page)
    await openSearch(page)
    await setTargets(page, ['nothing*'])

    await expect(page.getByTestId('search-targets-matched')).toContainText('No indices match')
    await expect(page.getByTestId('search-no-results')).toBeVisible()
  })

  test('lists columns from the mappings of all selected indices', async ({ page }) => {
    await setup(page)
    await openSearch(page)

    await page.getByTestId('search-columns').click()
    const list = page.getByTestId('search-columns-list')
    await expect(list).toContainText('In all indices')
    await expect(list).toContainText('Only in some indices')
    await expect(page.getByTestId('search-column-option').filter({ hasText: /^rating/ })).not.toContainText('index')
    await expect(page.getByTestId('search-column-option').filter({ hasText: /^year/ })).toContainText('in 1 index')
    await expect(page.getByTestId('search-column-option').filter({ hasText: /^director\.name/ })).toBeVisible()
    await expect(page.getByTestId('search-column-option').filter({ hasText: /keyword/ })).toHaveCount(0)
    await expect(page.getByTestId('search-column-option').filter({ hasText: /^director(\s|$)/ })).toHaveCount(0)

    await page.getByTestId('search-columns-filter').fill('time prep')
    await expect(page.getByTestId('search-column-option')).toHaveText([/time\.prep/])
  })

  test('renders selected columns for documents with different fields', async ({ page }) => {
    await setup(page)
    await openSearch(page)

    await toggleColumn(page, 'time.prep')
    await toggleColumn(page, 'Document')
    await expect(headers(page)).toHaveText([
      '',
      '_index',
      '_id',
      'title',
      'year',
      'rating',
      'director.name',
      '@timestamp',
      'time.prep',
      'Document',
      ''
    ])

    await page.locator('.q-table__bottom').getByRole('button').last().click()
    const recipeRow = rows(page).filter({ hasText: 'r1' })
    await expect(recipeRow).toBeVisible()
    await expect(recipeRow.locator('td').nth(3)).toHaveText('')
    await expect(recipeRow.locator('td').nth(5)).toHaveText('easy')
    await expect(recipeRow.locator('td').nth(8)).toHaveText('10')
    await expect(recipeRow.locator('td').nth(9)).toContainText('name: Pancakes')
  })

  test('remembers columns per index selection', async ({ page }) => {
    await setup(page)
    await openSearch(page)

    await toggleColumn(page, 'year')
    await expect(headers(page)).not.toContainText(['year'])

    await setTargets(page, ['recipes'])
    await expect(headers(page)).toHaveText(['', '_index', '_id', 'name', 'rating', 'time.prep', ''])
    await toggleColumn(page, 'Document')
    await expect(headers(page)).toContainText(['Document'])

    await setTargets(page, ['*'])
    await expect(headers(page)).not.toContainText(['year'])
    await expect(headers(page)).not.toContainText(['Document'])

    await page.getByTestId('search-columns').click()
    await page.getByTestId('search-columns-none').click()
    await expect(headers(page)).toHaveText(['', ''])
    await page.getByTestId('search-columns-reset').click()
    await expect(headers(page)).toHaveText(['', '_index', '_id', 'title', 'year', 'rating', 'director.name', '@timestamp', ''])
    await page.getByTestId('search-columns-filter').fill('time')
    await page.getByTestId('search-columns-all').click()
    await expect(headers(page)).toContainText(['@timestamp', 'time.prep'])
  })

  test('sorts by sortable fields with unmapped_type and blocks conflicting fields', async ({ page }) => {
    const requests = await setup(page)
    await openSearch(page)
    await headers(page).filter({ hasText: 'year' }).click()
    await expect.poll(() => lastSearch(requests).body.sort).toEqual([{ year: { order: 'asc', unmapped_type: 'long' } }])

    await headers(page).filter({ hasText: 'year' }).click()
    await expect.poll(() => lastSearch(requests).body.sort).toEqual([{ year: { order: 'desc', unmapped_type: 'long' } }])

    await headers(page).filter({ hasText: 'title' }).click()
    await expect
      .poll(() => lastSearch(requests).body.sort)
      .toEqual([{ 'title.keyword': { order: 'asc', unmapped_type: 'keyword' } }])
    await expect(rows(page).first()).toContainText('Alien')

    await expect(headers(page).filter({ hasText: 'rating' })).not.toHaveClass(/sortable/)
    await expect(headers(page).filter({ hasText: /^_id/ })).not.toHaveClass(/sortable/)
    await expect(headers(page).filter({ hasText: /^_index/ })).toHaveClass(/sortable/)
  })

  test('runs lucene queries, resets with escape and paginates remotely', async ({ page }) => {
    const requests = await setup(page)
    await openSearch(page)

    await queryInput(page).fill('title:Alien')
    await queryInput(page).press('Enter')
    await expect(rows(page)).toHaveCount(1)
    expect(lastSearch(requests).body.query).toEqual({ bool: { must: [{ query_string: { query: 'title:Alien' } }] } })
    expect(page.url()).toContain('q=title:Alien')

    await queryInput(page).press('Escape')
    await expect(queryInput(page)).toHaveValue('*')
    await page.getByTestId('search-submit').click()
    await expect(page.getByTestId('search-total')).toHaveText('27 hits')

    await page.locator('.q-table__bottom').getByRole('button').nth(2).click()
    await expect.poll(() => lastSearch(requests).body.from).toBe(10)
    await expect(rows(page).first()).toContainText('m11')
  })

  test('shows inexact totals and counts exactly on demand', async ({ page }) => {
    const requests = await setup(page)
    await openSearch(page)
    await setTargets(page, ['logs-app'])

    await expect(page.getByTestId('search-total')).toHaveText('10,000+ hits')
    await page.getByTestId('search-count-exactly').click()
    await expect(page.getByTestId('search-total')).toHaveText('12,345 hits')
    expect(lastSearch(requests).body.track_total_hits).toBe(true)
    await expect(page.getByTestId('search-count-exactly')).toHaveCount(0)
  })

  test('edits the request in DSL mode, paginates inside the JSON and returns to query mode', async ({ page }) => {
    const requests = await setup(page)
    await openSearch(page)
    await queryInput(page).fill('title:Alien')
    await queryInput(page).press('Enter')

    await page.getByTestId('search-mode').getByText('DSL').click()
    const editor = page.getByTestId('search-dsl').locator('.cm-content')
    await expect(editor).toContainText('"query_string"')
    await expect(queryInput(page)).toHaveCount(0)

    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.insertText('{"query": {"match_all": {}}, "size": 5, "aggs": {"years": {"terms": {"field": "year"}}}}')
    await page.keyboard.press('Control+Enter')
    await expect(rows(page)).toHaveCount(5)
    expect(lastSearch(requests).body).toMatchObject({ size: 5, aggs: { years: { terms: { field: 'year' } } } })

    await page.getByRole('tab', { name: 'Aggregations' }).click()
    await expect(page.locator('.q-tab-panel').getByText('doc_count')).toBeVisible()
    await page.getByRole('tab', { name: 'Hits' }).click()

    await page.locator('.q-table__bottom').getByRole('button').nth(2).click()
    await expect.poll(() => lastSearch(requests).body.from).toBe(5)
    await expect(editor).toContainText('"from": 5')

    page.once('dialog', (dialog) => dialog.accept())
    await page.getByTestId('search-mode').getByText('Query').click()
    await expect(queryInput(page)).toHaveValue('title:Alien')
  })

  test('shows invalid DSL json', async ({ page }) => {
    await setup(page)
    await openSearch(page)
    await page.getByTestId('search-mode').getByText('DSL').click()

    await page.getByTestId('search-dsl').locator('.cm-content').click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.insertText('{"query": ')
    await page.getByTestId('search-submit').click()
    await expect(page.getByTestId('search-invalid-json')).toBeVisible()
  })

  test('loads index and query from the url', async ({ page }) => {
    const requests = await setup(page)
    await page.goto('http://localhost:5175/cluster/0/search?index=recipes&q=name:Pancakes')

    await expect(chips(page)).toHaveText(['recipes'])
    await expect(queryInput(page)).toHaveValue('name:Pancakes')
    await expect(rows(page)).toHaveCount(1)
    expect(lastSearch(requests).path).toBe('/recipes/_search')
  })

  test('opens the request in the REST page', async ({ page }) => {
    await setup(page)
    await openSearch(page)
    await queryInput(page).fill('title:Alien')
    await queryInput(page).press('Enter')

    await page.getByTestId('search-open-rest').click()
    await expect(page.getByTestId('rest-path')).toHaveValue('*/_search')
    await expect(page.getByTestId('rest-request-body').locator('.cm-content')).toContainText('title:Alien')
  })

  test('opens the request in a new active tab after the stored rest tabs', async ({ page }) => {
    await setup(page)
    await page.goto('http://localhost:5175/cluster/0/rest')
    await page.getByTestId('rest-tab-add').click()
    await expect(page.getByTestId('rest-tab')).toHaveCount(2)
    await page.goto('http://localhost:5175/cluster/0/search')
    await expect(rows(page).first()).toBeVisible()

    await page.getByTestId('search-open-rest').click()
    await expect(page.getByTestId('rest-tab')).toHaveText([/Tab 1/, /Tab 2/, /Tab 3/])
    await expect(page.getByTestId('rest-tab').nth(2)).toHaveClass(/q-tab--active/)
    await expect(page.getByTestId('rest-path')).toHaveValue('*/_search')
  })

  test('copies the request as curl', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are chromium only')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await setup(page)
    await openSearch(page)

    await page.getByTestId('search-copy-curl').click()
    const text = await page.evaluate(() => navigator.clipboard.readText())
    expect(text).toContain("curl -X POST 'http://localhost:9200/*/_search'")
    expect(text).toContain('"match_all"')
  })

  test('edits and deletes single documents', async ({ page }) => {
    const requests = await setup(page)
    await openSearch(page)

    await rows(page).first().dblclick()
    await expect(page.locator('.q-dialog').getByText('movies / _doc / m1')).toBeVisible()
    await expect(page.locator('.q-dialog .cm-content')).toContainText('Ridley Scott')
    await page.keyboard.press('Escape')

    page.once('dialog', (dialog) => dialog.accept())
    await rows(page).first().getByTestId('search-result-delete').click()
    await expect.poll(() => requests.some((r) => r.method === 'DELETE' && r.path.startsWith('/movies/_doc/m1'))).toBe(true)
  })

  test('bulk deletes selected documents', async ({ page }) => {
    const requests = await setup(page)
    await openSearch(page)

    await rows(page).nth(0).locator('.q-checkbox').click()
    await rows(page).nth(1).locator('.q-checkbox').click()
    await page.getByRole('button', { name: /bulk/i }).click()
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByText('Delete documents').click()

    await expect.poll(() => requests.find((r) => r.path.startsWith('/_bulk'))?.raw).toContain('"_id":"m2"')
  })

  test('downloads the search response', async ({ page }) => {
    await setup(page)
    await openSearch(page)

    const download = page.waitForEvent('download')
    await page.getByTestId('search-download').click()
    await page.getByTestId('search-download-json').click()
    expect((await download).suggestedFilename()).toBe('search.json')
  })

  test('falls back to the page fields when too many indices match', async ({ page }) => {
    const requests = await setup(page)
    await openSearch(page)
    await setTargets(page, ['many*'])

    await expect(page.getByTestId('search-targets-matched')).toContainText('600 indices')
    await page.getByTestId('search-columns').click()
    await expect(page.getByTestId('search-columns-skipped')).toBeVisible()
    expect(requests.some((r) => r.path.startsWith('/many*/_field_caps'))).toBe(false)
  })

  test('migrates the search settings of older versions', async ({ page }) => {
    const requests = await setup(page)
    await page.addInitScript((uuid) => {
      window.localStorage.setItem(
        `search-${uuid}`,
        JSON.stringify({
          indices: 'recipes',
          q: 'name:Lasagna',
          searchQuery: '{"query":{"match_all":{}},"size":1}',
          searchQueryCollapsed: true,
          visibleColumns: ['old'],
          pagination: { rowsPerPage: 10 }
        })
      )
    }, CLUSTER_UUID)
    await page.goto('http://localhost:5175/cluster/0/search')

    await expect(chips(page)).toHaveText(['recipes'])
    await expect(page.getByTestId('search-dsl').locator('.cm-content')).toContainText('"size": 1')
    await expect(rows(page)).toHaveCount(1)
    expect(lastSearch(requests)).toMatchObject({ path: '/recipes/_search', body: { size: 1 } })
  })
})

test.describe('Search on elasticsearch 2', () => {
  test('uses mappings and cat apis instead of field caps and resolve', async ({ page }) => {
    const requests = await setup(page, { version: 2 })
    await openSearch(page)

    await page.getByTestId('search-columns').click()
    await expect(page.getByTestId('search-column-option').filter({ hasText: /^_type/ })).toBeVisible()
    await expect(page.getByTestId('search-column-option').filter({ hasText: /^director\.name/ })).toBeVisible()
    await page.keyboard.press('Escape')

    await headers(page).filter({ hasText: 'title' }).click()
    await expect.poll(() => lastSearch(requests).body.sort).toEqual([{ 'title.raw': { order: 'asc', unmapped_type: 'string' } }])
    await expect(headers(page).filter({ hasText: /^_id/ })).toHaveClass(/sortable/)

    expect(requests.some((r) => r.path.includes('_field_caps'))).toBe(false)
    expect(requests.some((r) => r.path.includes('_resolve'))).toBe(false)
    expect(requests.some((r) => r.path.endsWith('/_mapping'))).toBe(true)
  })
})
