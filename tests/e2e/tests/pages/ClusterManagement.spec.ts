import { test, expect, Page } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { mockElastic8 as mockElastic } from '../../mocks/elastic_8'

test.describe.configure({ mode: 'parallel' })

const setupClusterSelectionTest = async (page: Page) => {
  await mockElastic(page)
  await setupClusterConnection(page)
  await page.getByTestId('cluster-selection').click()
  return page.getByTestId('cluster-table')
}

test.describe('ClusterManagement', () => {
  test('table contains cluster names', async ({ page }) => {
    const table = await setupClusterSelectionTest(page)

    const rows = table.locator('tbody').locator('tr')

    await expect(rows).toHaveCount(2)
    await expect(table).toContainText('default cluster')
    await expect(table).toContainText('dev cluster')
  })

  test('can filter cluster names', async ({ page }) => {
    const table = await setupClusterSelectionTest(page)

    await expect(table).toContainText('dev cluster')
    await page.getByTestId('cluster-table-filter').fill('default cluster')

    await expect(table).toContainText('default cluster')
    await expect(table).not.toContainText('dev cluster')
  })

  test('can change cluster without reloading the page', async ({ page }) => {
    await setupClusterSelectionTest(page)
    await page.evaluate(() => ((window as unknown as { noReload: boolean }).noReload = true))
    await page.getByTestId('cluster-table-row-1').click()

    await page.waitForURL('**/cluster/dev-cluster')
    await expect(page.getByTestId('cluster-selection')).toContainText('dev cluster')
    expect(await page.evaluate(() => (window as unknown as { noReload?: boolean }).noReload)).toBe(true)
  })
})
