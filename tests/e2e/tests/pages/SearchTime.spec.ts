import { test, expect, Page } from '@playwright/test'
import {
  CLUSTER_UUID,
  boundsSearches,
  histogramSearches,
  lastSearch,
  openSearch,
  searches,
  setTargets,
  setupSearch
} from '../../helpers/search'
import type { SearchBody } from '../../mocks/search'

test.describe.configure({ mode: 'parallel' })

const DATE_FORMAT = 'strict_date_optional_time||epoch_millis'

const timeButton = (page: Page) => page.getByTestId('search-time-range')
const histogram = (page: Page) => page.getByTestId('search-histogram')

const openHistogram = async (page: Page) => {
  await page.getByTestId('search-histogram-toggle').click()
  await expect(histogram(page)).toBeVisible()
}

const pickPreset = async (page: Page, label: string) => {
  await timeButton(page).click()
  await page.getByTestId('search-time-preset').filter({ hasText: label }).click()
}

type RangeClause = { range?: Record<string, { gte: string; lte: string; format?: string }> }

const timeFilter = (body: SearchBody) =>
  (body.query?.bool as { filter?: RangeClause[] } | undefined)?.filter?.find((clause) => clause.range)?.range

test.describe('Search time range', () => {
  test('is hidden when the targets have no date field', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)
    await expect(timeButton(page)).toHaveText(/All time/)

    await setTargets(page, ['recipes'])
    await expect(page.getByTestId('search-result')).toHaveCount(2)
    await expect(timeButton(page)).toHaveCount(0)
    await expect(page.getByTestId('search-histogram-toggle')).toHaveCount(0)
  })

  test('filters by a preset and sorts by the time field descending', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)
    expect(timeFilter(lastSearch(requests).body)).toBeUndefined()

    await pickPreset(page, 'Last 15 minutes')
    await expect(timeButton(page)).toHaveText(/Last 15 minutes/)
    await expect
      .poll(() => timeFilter(lastSearch(requests).body))
      .toEqual({ '@timestamp': { gte: 'now-15m', lte: 'now', format: DATE_FORMAT } })
    expect(lastSearch(requests).body.sort).toEqual([{ '@timestamp': { order: 'desc', unmapped_type: 'date' } }])
    expect(page.url()).toContain('from=now-15m')
    expect(page.url()).toContain('to=now')

    await pickPreset(page, 'All time')
    await expect.poll(() => timeFilter(lastSearch(requests).body)).toBeUndefined()
    expect(lastSearch(requests).body.sort).toEqual([{ '@timestamp': { order: 'desc', unmapped_type: 'date' } }])
  })

  test('keeps an existing sort when picking a range', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)
    await page.locator('[data-testid=search-results-table] thead th').filter({ hasText: /^year/ }).click()
    await expect.poll(() => lastSearch(requests).body.sort).toEqual([{ year: { order: 'asc', unmapped_type: 'long' } }])

    await pickPreset(page, 'Last 7 days')
    await expect.poll(() => timeFilter(lastSearch(requests).body)?.['@timestamp'].gte).toBe('now-7d')
    expect(lastSearch(requests).body.sort).toEqual([{ year: { order: 'asc', unmapped_type: 'long' } }])
  })

  test('filters by an absolute range', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)

    await timeButton(page).click()
    await page.getByTestId('search-time-from').fill('2024-01-02 00:00:00')
    await page.getByTestId('search-time-to').fill('2024-01-05 12:30:00')
    await page.getByTestId('search-time-apply').click()

    await expect.poll(() => timeFilter(lastSearch(requests).body)?.['@timestamp']).toBeDefined()
    const { gte, lte } = timeFilter(lastSearch(requests).body)['@timestamp']
    expect(new Date(gte).getTime()).toBe(new Date('2024-01-02T00:00:00').getTime())
    expect(new Date(lte).getTime()).toBe(new Date('2024-01-05T12:30:00').getTime())
    await expect(timeButton(page)).toHaveText(/2024-01-02 00:00:00 → 2024-01-05 12:30:00/)
  })

  test('switches the time field', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)
    await setTargets(page, ['movies', 'weird'])
    await pickPreset(page, 'Last hour')

    await timeButton(page).click()
    await page.getByTestId('search-time-field').click()
    await page.locator('.q-menu .q-item').filter({ hasText: /^ts$/ }).click()

    await expect
      .poll(() => timeFilter(lastSearch(requests).body))
      .toEqual({ ts: { gte: 'now-1h', lte: 'now', format: DATE_FORMAT } })
    expect(lastSearch(requests).body.sort).toEqual([{ ts: { order: 'desc', unmapped_type: 'date' } }])
    expect(page.url()).toContain('time_field=ts')
  })

  test('loads the range and time field from the url', async ({ page }) => {
    const requests = await setupSearch(page)
    await page.goto('http://localhost:5175/cluster/0/search?index=movies,weird&q=*&from=now-4h&to=now&time_field=ts')

    await expect(timeButton(page)).toHaveText(/Last 4 hours/)
    await expect
      .poll(() => timeFilter(lastSearch(requests).body))
      .toEqual({ ts: { gte: 'now-4h', lte: 'now', format: DATE_FORMAT } })
    expect(lastSearch(requests).path).toBe('/movies,weird/_search')
  })

  test('sends the date format on elasticsearch 2', async ({ page }) => {
    const requests = await setupSearch(page, { version: 2 })
    await openSearch(page)
    await pickPreset(page, 'Last 24 hours')

    await expect
      .poll(() => timeFilter(lastSearch(requests).body))
      .toEqual({ '@timestamp': { gte: 'now-24h', lte: 'now', format: DATE_FORMAT } })
  })
})

test.describe('Search histogram', () => {
  test('renders buckets over all time and narrows the range on click', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)

    await openHistogram(page)
    await expect(page.getByText('per 12h')).toBeVisible()
    expect(boundsSearches(requests).at(-1)!.body.aggs).toEqual({
      min: { min: { field: '@timestamp' } },
      max: { max: { field: '@timestamp' } }
    })
    expect(histogramSearches(requests).at(-1)!.body.aggs!.histogram!.date_histogram).toEqual({
      field: '@timestamp',
      fixed_interval: '12h',
      min_doc_count: 0,
      extended_bounds: { min: Date.parse('2024-01-01T10:00:00Z'), max: Date.parse('2024-01-25T10:00:00Z') }
    })

    await expect
      .poll(() =>
        histogram(page)
          .locator('canvas')
          .evaluate((canvas) => {
            const context = (canvas as HTMLCanvasElement).getContext('2d')!
            const { width, height } = canvas as HTMLCanvasElement
            const pixels = context.getImageData(0, 0, width, height).data
            return pixels.some((value, i) => i % 4 === 3 && value > 0)
          })
      )
      .toBe(true)

    const box = (await histogram(page).locator('canvas').boundingBox())!
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)

    await expect.poll(() => timeFilter(lastSearch(requests).body)?.['@timestamp']?.gte).toMatch(/^2024-01-1\d/)
    const { gte, lte } = timeFilter(lastSearch(requests).body)['@timestamp']
    expect(Date.parse(lte) - Date.parse(gte)).toBe(12 * 3_600_000 - 1)
    await expect(page.getByText('per 30m')).toBeVisible()
  })

  test('uses relative bounds without a min/max request', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)
    await openHistogram(page)
    await expect(page.getByText('per 12h')).toBeVisible()
    const bounds = boundsSearches(requests).length

    await pickPreset(page, 'Last hour')
    await expect.poll(() => histogramSearches(requests).at(-1)!.body.aggs!.histogram!.date_histogram.fixed_interval).toBe('1m')
    const { extended_bounds } = histogramSearches(requests).at(-1)!.body.aggs!.histogram!.date_histogram
    expect(extended_bounds.max - extended_bounds.min).toBe(3_600_000)
    expect(timeFilter(histogramSearches(requests).at(-1)!.body)?.['@timestamp'].gte).toBe('now-1h')
    expect(boundsSearches(requests)).toHaveLength(bounds)
  })

  test('uses interval instead of fixed_interval before elasticsearch 7.2', async ({ page }) => {
    const requests = await setupSearch(page, { version: 6 })
    await openSearch(page)

    await openHistogram(page)
    await expect(page.getByText('per 12h')).toBeVisible()
    const aggregation = histogramSearches(requests).at(-1)!.body.aggs!.histogram!.date_histogram
    expect(aggregation.interval).toBe('12h')
    expect(aggregation).not.toHaveProperty('fixed_interval')
  })

  test('starts collapsed and only queries while open', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)
    await expect(page.getByTestId('search-histogram-toggle')).toBeVisible()
    await expect(histogram(page)).toHaveCount(0)

    await pickPreset(page, 'Last hour')
    await expect.poll(() => timeFilter(lastSearch(requests).body)?.['@timestamp'].gte).toBe('now-1h')
    expect(histogramSearches(requests)).toHaveLength(0)
    expect(boundsSearches(requests)).toHaveLength(0)

    await openHistogram(page)
    await expect.poll(() => histogramSearches(requests).length).toBe(1)
    const stored = () => page.evaluate((uuid) => localStorage.getItem(`search-${uuid}`), CLUSTER_UUID)
    expect(JSON.parse((await stored())!).histogramCollapsed).toBe(false)

    await page.getByTestId('search-histogram-toggle').click()
    await expect(histogram(page)).toHaveCount(0)
    await pickPreset(page, 'Last 4 hours')
    await expect.poll(() => timeFilter(lastSearch(requests).body)?.['@timestamp'].gte).toBe('now-4h')
    expect(histogramSearches(requests)).toHaveLength(1)
    expect(JSON.parse((await stored())!).histogramCollapsed).toBe(true)
  })

  test('is hidden in DSL mode', async ({ page }) => {
    await setupSearch(page)
    await openSearch(page)
    await openHistogram(page)

    await page.getByTestId('search-mode').getByText('DSL').click()
    await expect(histogram(page)).toHaveCount(0)
    await expect(timeButton(page)).toHaveCount(0)
  })
})

test.describe('Search auto refresh', () => {
  test('repeats the search until turned off', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)
    await openHistogram(page)
    const before = searches(requests).length

    await page.locator('.reload-button__interval').click()
    await page.locator('.reload-button__menu .q-item').filter({ hasText: /^1s$/ }).click()
    await expect.poll(() => searches(requests).length, { timeout: 5000 }).toBeGreaterThan(before + 1)
    await expect.poll(() => histogramSearches(requests).length).toBeGreaterThan(1)

    await page.locator('.reload-button__interval').click()
    await page.locator('.reload-button__menu .q-item').filter({ hasText: 'Auto reload off' }).click()
    const stopped = searches(requests).length
    await page.waitForTimeout(2500)
    expect(searches(requests).length).toBeLessThanOrEqual(stopped + 1)
  })

  test('pauses while the DSL editor is focused', async ({ page }) => {
    const requests = await setupSearch(page)
    await openSearch(page)
    await page.getByTestId('search-mode').getByText('DSL').click()
    await page.locator('[data-testid=search-dsl] .cm-content').click()

    await page.locator('.reload-button__interval').click()
    await page.locator('.reload-button__menu .q-item').filter({ hasText: /^1s$/ }).click()
    await expect(page.locator('.reload-button__menu')).toBeHidden()
    await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('.reload-button__interval'))).toBe(true)
    await page.locator('[data-testid=search-dsl] .cm-content').click()
    await expect(page.locator('[data-testid=search-dsl] .cm-content')).toBeFocused()
    const before = searches(requests).length
    await page.waitForTimeout(2500)
    expect(searches(requests).length).toBe(before)

    await page.locator('h1').click()
    await expect.poll(() => searches(requests).length, { timeout: 5000 }).toBeGreaterThan(before)
  })
})
