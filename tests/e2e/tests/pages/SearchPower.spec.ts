import { readFile } from 'node:fs/promises'
import { test, expect, Page } from '@playwright/test'
import { CLUSTER_UUID, lastSearch, openSearch, queryInput, setupSearch } from '../../helpers/search'
import type { RecordedRequest } from '../../mocks/search'

test.describe.configure({ mode: 'parallel' })

const modeButtons = (page: Page) => page.getByTestId('search-mode').getByRole('button')
const sqlInput = (page: Page) => page.getByTestId('search-sql-query')
const sqlTable = (page: Page) => page.getByTestId('search-sql-results')
const sqlRequests = (requests: RecordedRequest[]) =>
  requests.filter((r) => /^\/(_sql|_xpack\/sql|_plugins\/_sql|_query)/.test(r.path))
const libraryItems = (page: Page) => page.getByTestId('search-library-item')

const setMode = (page: Page, label: string) => page.getByTestId('search-mode').getByText(label, { exact: true }).click()

const openLibrary = async (page: Page, tab: 'history' | 'saved') => {
  await page.getByTestId('search-library-open').click()
  await page.getByTestId(`search-library-${tab}`).click()
}

test.describe('Search SQL and ES|QL modes', () => {
  const versions = [
    { version: 2, modes: ['Query', 'DSL'] },
    { version: 6, modes: ['Query', 'DSL', 'SQL'] },
    { version: 7, modes: ['Query', 'DSL', 'SQL'] },
    { version: 8, modes: ['Query', 'DSL', 'SQL', 'ES|QL'] },
    { version: 'opensearch', modes: ['Query', 'DSL', 'SQL'] }
  ] as const

  for (const { version, modes } of versions) {
    test(`offers ${modes.join(', ')} on ${version}`, async ({ page }) => {
      await setupSearch(page, { version })
      await openSearch(page)
      await expect(modeButtons(page)).toHaveText([...modes])
    })
  }

  test('runs sql with a prefilled query, pages with the cursor and opens it in REST', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)

    await setMode(page, 'SQL')
    await expect(sqlInput(page)).toHaveValue('SELECT *\nFROM "*"\nLIMIT 100')
    await expect(page.getByTestId('search-targets')).toHaveCount(0)
    await expect(sqlTable(page).locator('thead th')).toHaveText(['title', 'year'])
    await expect(sqlTable(page).locator('tbody tr')).toHaveCount(2)
    await expect(page.getByTestId('search-sql-total')).toHaveText('2 rows+')
    expect(sqlRequests(requests).at(-1)).toMatchObject({
      path: '/_sql?format=json',
      body: { query: 'SELECT *\nFROM "*"\nLIMIT 100', fetch_size: 100, field_multi_value_leniency: true }
    })

    await page.getByTestId('search-sql-load-more').click()
    await expect(sqlTable(page).locator('tbody tr')).toHaveCount(3)
    await expect(page.getByTestId('search-sql-total')).toHaveText('3 rows')
    await expect(page.getByTestId('search-sql-load-more')).toHaveCount(0)
    expect(sqlRequests(requests).at(-1)!.body).toEqual({ cursor: 'page2' })

    await page.getByTestId('search-open-rest').click()
    await expect(page.getByTestId('rest-path')).toHaveValue('_sql?format=json')
    await expect(page.getByTestId('rest-request-body').locator('.cm-content')).toContainText('fetch_size')
  })

  test('shows sql errors and runs edited queries with ctrl+enter', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)
    await setMode(page, 'SQL')
    await expect(sqlTable(page)).toBeVisible()

    await sqlInput(page).fill('BROKEN query')
    await sqlInput(page).press('Control+Enter')
    await expect(page.getByText('mismatched input BROKEN')).toBeVisible()

    await sqlInput(page).fill('SELECT title FROM movies')
    await sqlInput(page).press('Control+Enter')
    await expect(sqlTable(page).locator('tbody tr')).toHaveCount(2)
    expect(sqlRequests(requests).at(-1)!.body).toEqual({
      query: 'SELECT title FROM movies',
      fetch_size: 100,
      field_multi_value_leniency: true
    })
  })

  test('runs ES|QL on elasticsearch 8', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)

    await setMode(page, 'ES|QL')
    await expect(sqlInput(page)).toHaveValue('FROM *\n| LIMIT 100')
    await expect(sqlTable(page).locator('tbody tr')).toHaveCount(2)
    await expect(page.getByTestId('search-sql-load-more')).toHaveCount(0)
    expect(sqlRequests(requests).at(-1)).toMatchObject({ path: '/_query?format=json', body: { query: 'FROM *\n| LIMIT 100' } })

    await setMode(page, 'Query')
    await expect(page.getByTestId('search-result').first()).toBeVisible()
  })

  test('uses _xpack/sql on elasticsearch 6 and the sql plugin on opensearch', async ({ page }) => {
    const requests = await setupSearch(page, { version: 6 })
    await openSearch(page)
    await setMode(page, 'SQL')
    await expect(sqlTable(page).locator('tbody tr')).toHaveCount(2)
    expect(sqlRequests(requests).at(-1)!.path).toBe('/_xpack/sql?format=json')
  })

  test('reads opensearch jdbc responses', async ({ page }) => {
    const requests = await setupSearch(page, { version: 'opensearch' })
    await openSearch(page)
    await setMode(page, 'SQL')
    await expect(sqlTable(page).locator('tbody tr').first()).toContainText('Alien')
    expect(sqlRequests(requests).at(-1)!.path).toBe('/_plugins/_sql?format=jdbc')
  })
})

test.describe('Search history and saved searches', () => {
  test('records searches with filters and time and loads them back', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)

    await page.getByTestId('search-filter-add').click()
    await page.getByTestId('search-filter-field').fill('title')
    await page
      .locator('.q-menu .q-item')
      .filter({ hasText: /^title$/ })
      .click()
    await page.getByTestId('search-filter-op').getByText('exists', { exact: true }).click()
    await page.getByTestId('search-filter-save').click()
    await page.getByTestId('search-time-range').click()
    await page.getByTestId('search-time-preset').filter({ hasText: 'Last hour' }).click()

    await queryInput(page).fill('title:Alien')
    await queryInput(page).press('Enter')
    await queryInput(page).press('Enter')
    await expect.poll(() => lastSearch(requests).body.query?.bool?.must?.[0]?.query_string?.query).toBe('title:Alien')

    await page.getByTestId('search-filter-chip').locator('.q-chip__icon--remove').click()
    await page.getByTestId('search-time-range').click()
    await page.getByTestId('search-time-preset').filter({ hasText: 'All time' }).click()
    await queryInput(page).fill('*')
    await queryInput(page).press('Enter')

    await openLibrary(page, 'history')
    await expect(libraryItems(page)).toHaveCount(2)
    await expect(libraryItems(page).nth(1)).toContainText('title:Alien')
    await expect(libraryItems(page).nth(1)).toContainText('1 filter')
    await libraryItems(page).nth(1).click()

    await expect(page.getByTestId('search-library')).toBeHidden()
    await expect(queryInput(page)).toHaveValue('title:Alien')
    await expect(page.getByTestId('search-filter-chip')).toHaveText([/title exists/])
    await expect(page.getByTestId('search-time-range')).toHaveText(/Last hour/)
    await expect
      .poll(() => lastSearch(requests).body.query?.bool)
      .toMatchObject({ must: [{ query_string: { query: 'title:Alien' } }] })
  })

  test('saves, renames, removes searches and keeps them across reloads', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)
    await queryInput(page).fill('year:1979')
    await queryInput(page).press('Enter')

    await openLibrary(page, 'history')
    await libraryItems(page).first().getByTestId('search-library-save').click()
    await page.getByTestId('rest-name-input').fill('Late seventies')
    await page.getByTestId('rest-name-save').click()
    await page.getByTestId('search-library-saved').click()
    await expect(libraryItems(page)).toHaveCount(1)
    await expect(libraryItems(page)).toContainText('Late seventies')

    await libraryItems(page).first().getByTestId('search-library-rename').click()
    await page.getByTestId('rest-name-input').fill('Seventies')
    await page.getByTestId('rest-name-save').click()
    await expect(libraryItems(page)).toContainText('Seventies')

    await page.reload()
    await expect(page.getByTestId('search-result').first()).toBeVisible()
    await openLibrary(page, 'saved')
    await expect(libraryItems(page)).toHaveText([/Seventies/])
    await page.getByTestId('search-library-history').click()
    await expect(libraryItems(page)).toHaveText([/year:1979/])

    await libraryItems(page).first().getByTestId('search-library-remove').click()
    await expect(page.getByTestId('search-library-empty')).toBeVisible()
    await page.getByTestId('search-library-saved').click()
    await libraryItems(page).first().getByTestId('search-library-remove').click()
    await expect(page.getByTestId('search-library-empty')).toBeVisible()
  })

  test('saves the current search and suggests recent queries', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)
    await queryInput(page).fill('director.name:"Ridley Scott"')
    await queryInput(page).press('Enter')
    await queryInput(page).fill('*')
    await queryInput(page).press('Enter')

    await queryInput(page).fill('ridley')
    const recent = page.getByTestId('search-query-suggestion').filter({ hasText: 'director.name:"Ridley Scott"' })
    await expect(recent).toBeVisible()
    await recent.click()
    await expect(queryInput(page)).toHaveValue('director.name:"Ridley Scott"')

    await page.getByTestId('search-library-open').click()
    await page.getByTestId('search-library-save-current').click()
    await expect(page.getByTestId('rest-name-input')).toHaveValue('director.name:"Ridley Scott"')
    await page.getByTestId('rest-name-input').fill('Scott')
    await page.getByTestId('rest-name-save').click()
    await expect(libraryItems(page)).toHaveText([/Scott/])
  })

  test('keeps sql searches in the history', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)
    await setMode(page, 'SQL')
    await sqlInput(page).fill('SELECT title FROM movies')
    await sqlInput(page).press('Control+Enter')
    await setMode(page, 'Query')

    await openLibrary(page, 'history')
    await libraryItems(page).filter({ hasText: 'SELECT title FROM movies' }).click()
    await expect(sqlInput(page)).toHaveValue('SELECT title FROM movies')
  })
})

test.describe('Search library storage', () => {
  test('upgrades an existing database without losing REST history', async ({ page }) => {
    await page.addInitScript((uuid) => {
      if (sessionStorage.getItem('seeded')) return
      sessionStorage.setItem('seeded', '1')
      const request = indexedDB.open(`elasticvue-${uuid}`, 2)
      request.onupgradeneeded = () => {
        const db = request.result
        const history = db.createObjectStore('restQueryHistory', { keyPath: 'id', autoIncrement: true })
        history.createIndex('date', 'date')
        db.createObjectStore('restQuerySavedQueries', { keyPath: 'id', autoIncrement: true })
        db.createObjectStore('restQueryTabs', { keyPath: 'id', autoIncrement: true })
        db.createObjectStore('restQueryResponses', { keyPath: 'id' })
        history.add({ method: 'GET', path: 'old/_count', body: '', date: new Date() })
      }
      request.onsuccess = () => request.result.close()
    }, CLUSTER_UUID)
    await setupSearch(page)
    await openSearch(page)
    await queryInput(page).fill('title:Alien')
    await queryInput(page).press('Enter')
    await openLibrary(page, 'history')
    await expect(libraryItems(page)).toHaveText([/title:Alien/])

    await page.goto('http://localhost:5175/cluster/0/rest')
    await page.getByTestId('rest-library-open').click()
    await page.getByTestId('rest-library-history').click()
    await expect(page.getByTestId('rest-library-item')).toContainText(['old/_count'])
  })

  test('includes search history and saved searches in backups', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)
    await queryInput(page).fill('title:Alien')
    await queryInput(page).press('Enter')
    await openLibrary(page, 'history')
    await expect(libraryItems(page)).toHaveCount(1)

    await page.goto('http://localhost:5175/cluster/0/settings')
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download backup' }).click()
    const backup = JSON.parse(await readFile((await (await download).path())!, 'utf8'))
    const tables = Object.values(backup.idb as Record<string, Record<string, { query?: string }[]>>)
    expect(tables.some((db) => db.searchHistory?.[0]?.query === 'title:Alien')).toBe(true)
    expect(tables.every((db) => Array.isArray(db.savedSearches))).toBe(true)
  })
})
