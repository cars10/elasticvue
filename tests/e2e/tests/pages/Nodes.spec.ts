import { test, expect } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { withElastic } from '../../mocks'

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
    })
  })
})
