import { test, expect } from '@playwright/test'
import { cell, headers, lastSearch, openSearch, rows, setTargets, setupSearch, toggleColumn } from '../../helpers/search'

test.describe.configure({ mode: 'parallel' })

test.describe('Search on elasticsearch 6', () => {
  test('shows typed documents, numeric totals and sorts by _id', async ({ page }) => {
    const requests = await setupSearch(page, { version: 6 })
    await openSearch(page)

    await expect(page.getByTestId('search-total')).toHaveText('27 hits')
    await expect(page.getByTestId('search-count-exactly')).toHaveCount(0)

    await toggleColumn(page, '_type')
    expect(await cell(page, 'm1', '_type')).toBe('doc')

    await headers(page).filter({ hasText: /^_id/ }).click()
    await expect.poll(() => lastSearch(requests).body.sort).toEqual([{ _id: { order: 'asc' } }])

    expect(requests.some((r) => r.path.includes('include_unmapped'))).toBe(false)
    expect(requests.some((r) => r.path.includes('_resolve'))).toBe(false)
    expect(lastSearch(requests).body).not.toHaveProperty('track_total_hits')
  })
})

test.describe('Search on elasticsearch 7', () => {
  test('uses resolve index, include_unmapped and exact totals', async ({ page }) => {
    const requests = await setupSearch(page, { version: 7 })
    await openSearch(page)

    await page.getByTestId('search-targets').fill('logs')
    await expect(page.locator('.q-menu .q-item').first()).toContainText('data stream')
    await page.keyboard.press('Escape')

    await setTargets(page, ['logs-app'])
    await page.getByTestId('search-count-exactly').click()
    await expect(page.getByTestId('search-total')).toHaveText('12,345 hits')

    expect(requests.some((r) => r.path.startsWith('/_resolve/index/*'))).toBe(true)
    expect(requests.some((r) => r.path.includes('_field_caps') && r.path.includes('include_unmapped=true'))).toBe(true)
    expect(lastSearch(requests).body.track_total_hits).toBe(true)
  })

  test('does not offer _type for typeless elasticsearch 7 documents', async ({ page }) => {
    await setupSearch(page, { version: 7 })
    await openSearch(page)

    await page.getByTestId('search-columns').click()
    await expect(page.getByTestId('search-column-option').filter({ hasText: /^_type/ })).toHaveCount(0)
  })
})

test.describe('Search on opensearch 2', () => {
  test('uses the elasticsearch 7.10 compatible apis', async ({ page }) => {
    const requests = await setupSearch(page, { version: 'opensearch' })
    await openSearch(page)

    await expect(rows(page)).toHaveCount(10)
    await page.getByTestId('search-columns').click()
    await expect(page.getByTestId('search-column-option').filter({ hasText: /^year/ })).toContainText('in 1 index')
    await page.keyboard.press('Escape')

    await headers(page)
      .filter({ hasText: /^title/ })
      .click()
    await expect
      .poll(() => lastSearch(requests).body.sort)
      .toEqual([{ 'title.keyword': { order: 'asc', unmapped_type: 'keyword' } }])

    await setTargets(page, ['logs-app'])
    await page.getByTestId('search-count-exactly').click()
    expect(lastSearch(requests).body.track_total_hits).toBe(true)

    expect(requests.some((r) => r.path.endsWith('/_mapping'))).toBe(false)
    expect(requests.some((r) => r.path.includes('_field_caps') && r.path.includes('include_unmapped=true'))).toBe(true)
  })
})
