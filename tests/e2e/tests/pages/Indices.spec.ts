import { test, expect } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { withElastic } from '../../mocks'

test.describe.configure({ mode: 'parallel' });

const setup = async (page: any, mockElastic: any) => {
  await mockElastic(page)
  await setupClusterConnection(page)
  await page.locator('#indices').click()
  return page.getByTestId('indices-table')
}

withElastic(({ mockElastic, elastic }) => {
  test.describe(`elasticsearch ${elastic.version}`, () => {
    test.describe('Indices', () => {
      test('shows a list of indices', async ({ page }) => {
        const table = await setup(page, mockElastic)

        await expect(table).toContainText('movies')
        await expect(table).toContainText('omdb')
      })

      test('can filter indices', async ({ page }) => {
        const table = await setup(page, mockElastic)

        await expect(table).toContainText('movies')
        await expect(table).toContainText('omdb')

        page.locator('input[name="filter"]').fill('movies')
        await expect(table).toContainText('movies')
        await expect(table).not.toContainText('omdb')
      })
    })
  })
})
