import { test, expect } from '@playwright/test'
import { openElasticvue } from '../../helpers'

test.describe.configure({ mode: 'parallel' });

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
        const body = page.locator('body')
        await page.getByTestId('change-theme-button').click()
        await page.getByTestId('change-theme__dark').click()

        await expect(body).toHaveClass(/theme--dark/)
        await expect(body).not.toHaveClass(/theme--light/)
      })
    })

    test.describe('language', () => {
      test('defaults to english', async ({ page }) => {
        await openElasticvue(page)
        await page.getByTestId('change-language-button').click()

        await expect(page.getByTestId('change-language__en')).toHaveClass(/q-item--active/)
      })
    })
  })
})
