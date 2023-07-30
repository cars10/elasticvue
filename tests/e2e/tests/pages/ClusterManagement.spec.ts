import { test, expect } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { mockElastic } from '../../mocks/api'

const setupClusterSelectionTest = async page => {
  await mockElastic(page)
  await setupClusterConnection(page)
  await page.getByTestId('cluster-selection').click()
  return await page.getByTestId('cluster-table')
}

test.describe('ClusterManagement', () => {
  test('table contains cluster names', async ({ page }) => {
    const table = await setupClusterSelectionTest(page)
    const rows = await table.locator('tbody').locator('tr')

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

  test('can change cluster', async ({ page }) => {
    await setupClusterSelectionTest(page)
    await page.getByTestId('cluster-table-row-1').click()

    expect(page.url()).toContain('/cluster/1')
  })

  test('can rename cluster', async ({ page }) => {
    const table = await setupClusterSelectionTest(page)
    await page.getByTestId('cluster-table-row-1').getByTestId('cluster-edit').click()

    const newName = 'foo'
    await page.getByTestId('cluster-edit-name').fill(newName)
    await page.getByTestId('cluster-edit-save').click()

    await expect(table).toContainText(newName)
  })
})