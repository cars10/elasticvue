import { test, expect } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { mockElastic } from '../../mocks/api'

test.describe('ClusterManagement', () => {
  test('table contains cluster names', async ({ page }) => {
    await mockElastic(page)
    await setupClusterConnection(page)

    await page.getByTestId('cluster-selection').click()
    const table = await page.getByTestId('cluster-table')

    await expect(table).toContainText('default cluster')
    await expect(table).toContainText('dev cluster')
  })
})