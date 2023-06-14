import { test, expect } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { mockElastic } from '../../mocks/api'

test.describe('Indices', () => {
  test('shows a list of indices', async ({ page }) => {
    await mockElastic(page)
    await setupClusterConnection(page)
    await page.getByTestId('header-indices').click()
    const table = await page.getByTestId('indices-table')

    await expect(table).toContainText('bignumbers')
    await expect(table).toContainText('geMVtqdZQYO04aguNpL9rQ')
    await expect(table).toContainText('dirkinator')
  })
})
