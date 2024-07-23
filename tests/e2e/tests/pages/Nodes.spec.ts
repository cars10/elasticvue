import { test, expect } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { withElastic } from '../../mocks'

test.describe.configure({ mode: 'parallel' });

withElastic(({ mockElastic, elastic }) => {
  test.describe(`elasticsearch ${elastic.version}`, () => {
    test.describe('Nodes', () => {
      test('shows a list of nodes', async ({ page }) => {
        await mockElastic(page)
        await setupClusterConnection(page)
        await page.locator('#nodes').click()

        const table = page.getByTestId('nodes-table')

        await expect(table).toContainText(elastic.node)
      })

      test('can filter nodes', async ({ page }) => {
        await mockElastic(page)
        await setupClusterConnection(page)
        await page.locator('#nodes').click()

        const table = page.getByTestId('nodes-table')

        page.locator('input[name="filter"]').fill(elastic.node)
        await expect(table).toContainText(elastic.node)

        page.locator('input[name="filter"]').fill('LOREM_IPSUM_INVALID_NODE_NAME')
        await expect(table).not.toContainText(elastic.node)
      })

      test('shows a list of node attributes', async ({ page }) => {
        await mockElastic(page)
        await setupClusterConnection(page)
        await page.locator('#nodes').click()

        const table = page.getByTestId('nodes-table')

        await expect(table).toContainText('datacenter')
        await expect(table).not.toContainText('xpack.')
      })
    })
  })
})
