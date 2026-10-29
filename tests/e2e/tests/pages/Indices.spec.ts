import { test, expect, Page } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { withElastic } from '../../mocks'
import { mockElastic8 } from '../../mocks/elastic_8'

test.describe.configure({ mode: 'parallel' })

const setup = async (page: Page, mockElastic: (page: Page) => Promise<void>) => {
  await mockElastic(page)
  await setupClusterConnection(page)
  await page.locator('#indices').click()
  return page.getByTestId('indices-table')
}

test.describe('Indices', () => {
  withElastic(({ mockElastic, elastic }) => {
    test(`shows a list of indices on ${elastic.version}`, async ({ page }) => {
      const table = await setup(page, mockElastic)

      await expect(table).toContainText('movies')
      await expect(table).toContainText('omdb')
    })
  })

  test('can filter indices', async ({ page }) => {
    const table = await setup(page, mockElastic8)

    await expect(table).toContainText('movies')
    await expect(table).toContainText('omdb')

    await page.locator('input[name="filter"]').fill('movies')
    await expect(table).toContainText('movies')
    await expect(table).not.toContainText('omdb')
  })

  test('still lists indices when alias call is forbidden', async ({ page }) => {
    await mockElastic8(page)
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
