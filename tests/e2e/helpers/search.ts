import { expect, Page } from '@playwright/test'
import { setupClusterConnection } from '../helpers'
import { mockElastic2 } from '../mocks/elastic_2'
import { mockElastic6 } from '../mocks/elastic_6'
import { mockElastic7 } from '../mocks/elastic_7'
import { mockElastic8 } from '../mocks/elastic_8'
import { mockOpensearch2 } from '../mocks/opensearch_2'
import { mockSearchCluster, RecordedRequest } from '../mocks/search'

export const CLUSTER_UUID = 'ecdKaffmR9WkFbKDW4PUWw'

const CLUSTER_MOCKS = { 2: mockElastic2, 6: mockElastic6, 7: mockElastic7, 8: mockElastic8, opensearch: mockOpensearch2 }

export const setupSearch = async (page: Page, { version = 8 }: { version?: keyof typeof CLUSTER_MOCKS } = {}) => {
  await CLUSTER_MOCKS[version](page)
  const requests = await mockSearchCluster(page, { version: version === 'opensearch' ? 7 : version })
  await setupClusterConnection(page)
  await page.waitForResponse((response) => response.url().startsWith('http://localhost:9200') && response.ok())
  return requests
}

export const openSearch = async (page: Page) => {
  await page.locator('#search').click()
  await expect(page.getByTestId('search-result').first()).toBeVisible()
}

const isHistogram = (request: RecordedRequest) => request.body.size === 0 && !!request.body.aggs?.histogram
const isBounds = (request: RecordedRequest) => request.body.size === 0 && !!request.body.aggs?.min
const isValues = (request: RecordedRequest) => request.body.size === 0 && !!request.body.aggs?.values

export const searches = (requests: RecordedRequest[]) =>
  requests.filter((r) => r.path.includes('/_search') && !isHistogram(r) && !isBounds(r) && !isValues(r))
export const valueSearches = (requests: RecordedRequest[]) => requests.filter(isValues)
export const histogramSearches = (requests: RecordedRequest[]) => requests.filter(isHistogram)
export const boundsSearches = (requests: RecordedRequest[]) => requests.filter(isBounds)
export const lastSearch = (requests: RecordedRequest[]) => searches(requests).at(-1)!

export const targetsInput = (page: Page) => page.getByTestId('search-targets')
export const chips = (page: Page) => page.getByTestId('search-target-chip')
export const rows = (page: Page) => page.getByTestId('search-result')
export const headers = (page: Page) => page.locator('[data-testid=search-results-table] thead th')
export const queryInput = (page: Page) => page.getByTestId('search-query')
export const nextPage = (page: Page) => page.locator('.q-table__bottom').getByRole('button').nth(2)

export const cell = (page: Page, rowText: string, column: string) =>
  page.evaluate(
    ({ rowText, column }) => {
      const table = document.querySelector('[data-testid=search-results-table]')!
      const index = [...table.querySelectorAll('thead th')].findIndex((th) => th.textContent?.trim() === column)
      const row = [...table.querySelectorAll('[data-testid=search-result]')].find((tr) => tr.textContent?.includes(rowText))
      return row?.querySelectorAll('td')[index]?.textContent?.trim() ?? null
    },
    { rowText, column }
  )

export const setTargets = async (page: Page, targets: string[]) => {
  while ((await chips(page).count()) > 0) await chips(page).first().locator('.q-chip__icon--remove').click()
  for (const target of targets) {
    await targetsInput(page).fill(target)
    await targetsInput(page).press('Enter')
  }
  await page.keyboard.press('Escape')
}

export const search = async (page: Page, q: string) => {
  await queryInput(page).fill(q)
  await queryInput(page).press('Enter')
}

export const toggleColumn = async (page: Page, name: string) => {
  await page.getByTestId('search-columns').click()
  await page.getByTestId('search-columns-filter').fill(name)
  await page
    .getByTestId('search-column-option')
    .filter({ has: page.getByText(name, { exact: true }) })
    .click()
  await page.keyboard.press('Escape')
}
