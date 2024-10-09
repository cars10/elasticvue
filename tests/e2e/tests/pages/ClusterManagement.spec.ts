import { test, expect, Page } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { withElastic } from '../../mocks'

test.describe.configure({ mode: 'parallel' });

const setupClusterSelectionTest = async (page: Page) => {
  await setupClusterConnection(page)
  await page.getByTestId('cluster-selection').click()
  return page.getByTestId('cluster-table')
}

withElastic(({ mockElastic, elastic }) => {
  test.describe(`elasticsearch ${elastic.version}`, () => {
    test.describe('ClusterManagement', () => {
      test('table contains cluster names', async ({ page }) => {
        const table = await setupClusterSelectionTest(page)

        await mockElastic(page)
        const rows = table.locator('tbody').locator('tr')

        await expect(rows).toHaveCount(2)
        await expect(table).toContainText('default cluster')
        await expect(table).toContainText('dev cluster')
      })

      test('can filter cluster names', async ({ page }) => {
        await mockElastic(page)
        const table = await setupClusterSelectionTest(page)

        await expect(table).toContainText('dev cluster')
        await page.getByTestId('cluster-table-filter').fill('default cluster')

        await expect(table).toContainText('default cluster')
        await expect(table).not.toContainText('dev cluster')
      })

      test('can change cluster', async ({ page }) => {
        await mockElastic(page)
        await setupClusterSelectionTest(page)
        await page.getByTestId('cluster-table-row-1').click()

        await page.waitForURL('**/cluster/1')
        expect(page.url()).toContain('/cluster/1')
      })

      test('can rename cluster', async ({ page }) => {
        const table = await setupClusterSelectionTest(page)

        await mockElastic(page)
        await page.getByTestId('cluster-table-row-1').getByTestId('cluster-edit').click()

        const newName = 'foo'
        await page.getByTestId('cluster-edit-name').fill(newName)
        await page.getByTestId('cluster-edit-save').click()

        await expect(table).toContainText(newName)
      })
    })
  })
})