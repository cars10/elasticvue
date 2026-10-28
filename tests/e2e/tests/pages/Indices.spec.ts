import { test, expect, Page } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { withElastic } from '../../mocks'

test.describe.configure({ mode: 'parallel' })

const setup = async (page: Page, mockElastic: (page: Page) => void) => {
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

      test('still lists indices when alias call is forbidden', async ({ page }) => {
        await mockElastic(page)
        await page.route('http://localhost:9200/*/_alias', async (route) => {
          await route.fulfill({
            status: 403,
            json: {
              error: {
                type: 'security_exception',
                reason: 'no permissions for [indices:admin/aliases/get]'
              },
              status: 403
            }
          })
        })
        await setupClusterConnection(page)
        await page.locator('#indices').click()

        const table = page.getByTestId('indices-table')
        await expect(table).toContainText('movies')
        await expect(table).toContainText('omdb')
        await expect(page.locator('.q-banner')).not.toBeVisible()
      })
    })
  })
})
