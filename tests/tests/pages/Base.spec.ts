import { test, expect } from '@playwright/test'
import { openElasticvue } from '../../helpers'

test.describe('base', () => {
  test('has a title', async ({ page }) => {
    await openElasticvue(page)
    await expect(page).toHaveTitle(/elasticvue/)
  })

  test.describe('footer', () => {
    test.describe('theme', () => {
      test('defaults to light theme', async ({ page }) => {
        await openElasticvue(page)
        const body = page.locator('body')
        await expect(body).toHaveClass(/theme--light/)
        await expect(body).not.toHaveClass(/theme--dark/)
      })

      test('can change to dark theme', async ({ page }) => {
        await openElasticvue(page)
        const body = await page.locator('body')
        page.getByTitle('Change theme').click()

        await expect(body).toHaveClass(/theme--dark/)
        await expect(body).not.toHaveClass(/theme--light/)
      })
    })

    test.describe('language', () => {
      test('defaults to english', async ({ page }) => {
        await openElasticvue(page)
        page.getByTitle('Change language').click()

        await expect(page.getByTitle('English')).toHaveClass(/q-item--active/)
      })

      test('can change to chinese', async ({ page }) => {
        await openElasticvue(page)
        page.getByTitle('Change language').click()
        const chinese = page.getByTitle('Chinese')
        chinese.click()

        await expect(chinese).toHaveClass(/q-item--active/)
      })
    })
  })
})
