import { test, expect } from '../../fixtures'
import { openElasticvue } from '../../helpers'

test.describe('theme', () => {
  test('changes to the dark theme and keeps it after a reload', async ({ page }) => {
    await openElasticvue(page)
    await page.getByTestId('change-theme-button').click()
    await page.getByTestId('change-theme__dark').click()

    await expect(page.locator('body')).toHaveClass(/theme--dark/)
    await expect.poll(() => page.evaluate(() => localStorage.getItem('theme'))).toContain('dark')
    await page.reload()
    await expect(page.locator('body')).toHaveClass(/theme--dark/)
  })
})
