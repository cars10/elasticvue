import { test, expect, Page } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { mockElastic8 } from '../../mocks/elastic_8'

test.describe.configure({ mode: 'parallel' })

const UPDATE_URL = 'https://update.elasticvue.com/**'
const SETTINGS_URL = 'http://localhost:5175/cluster/0/settings'
const CORS_HEADERS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }

const mockUpdate = async (page: Page, status: number, version?: string) => {
  const requests: string[] = []
  await page.unroute(UPDATE_URL)
  await page.route(UPDATE_URL, (route) => {
    if (route.request().method() !== 'OPTIONS') requests.push(route.request().url())
    return status === 200
      ? route.fulfill({ status, headers: CORS_HEADERS, json: { version } })
      : route.fulfill({ status, headers: CORS_HEADERS, body: '' })
  })
  return requests
}

const setup = async (page: Page) => {
  await mockElastic8(page)
  await setupClusterConnection(page)
}

const storedUpdateCheck = (page: Page) => page.evaluate(() => JSON.parse(window.localStorage.getItem('updateCheck') as string))

test.describe('update check', () => {
  test('shows an available update in the footer and in the settings', async ({ page }) => {
    await mockUpdate(page, 200, '99.0.0')
    await setup(page)

    const hint = page.getByTestId('update-hint')
    await expect(hint).toContainText('99.0.0')
    await hint.getByRole('link').click()

    await expect(page).toHaveURL(/\/settings$/)
    await expect(page.getByTestId('update-status')).toContainText('99.0.0')
    await expect(page.getByTestId('update-available')).toContainText('99.0.0')
    await expect(page.getByTestId('update-release-notes')).toHaveAttribute('href', /github\.com\/cars10\/elasticvue\/releases/)
    await expect(page.getByTestId('update-install-button')).toHaveCount(0)
  })

  test('shows up to date when there is no update', async ({ page }) => {
    await mockUpdate(page, 204)
    await setup(page)
    await page.goto(SETTINGS_URL)

    await expect(page.getByTestId('update-status')).toHaveText('Elasticvue is up to date')
    await expect(page.getByTestId('update-available')).toHaveCount(0)
    await expect(page.getByTestId('update-hint')).toHaveCount(0)
  })

  test('shows a failed check and recovers on a manual check', async ({ page }) => {
    await mockUpdate(page, 500)
    await setup(page)
    await page.goto(SETTINGS_URL)

    await expect(page.getByTestId('update-status')).toContainText('Update check failed')
    await expect(page.getByTestId('update-hint')).toHaveCount(0)

    await mockUpdate(page, 200, '99.0.0')
    await page.getByTestId('update-check-button').click()

    await expect(page.getByTestId('update-status')).toContainText('99.0.0')
    await expect(page.getByTestId('update-hint')).toContainText('99.0.0')
  })

  test('shows a failed check when the update server is unreachable', async ({ page }) => {
    await page.route(UPDATE_URL, (route) => route.abort())
    await setup(page)
    await page.goto(SETTINGS_URL)

    await expect(page.getByTestId('update-status')).toContainText('Update check failed')
  })

  test('can skip a version and undo it', async ({ page }) => {
    await mockUpdate(page, 200, '99.0.0')
    await setup(page)
    await page.goto(SETTINGS_URL)

    await expect(page.getByTestId('update-hint')).toContainText('99.0.0')
    await page.getByTestId('update-skip-button').click()

    await expect(page.getByTestId('update-hint')).toHaveCount(0)
    await expect(page.getByTestId('update-available')).toContainText('99.0.0')
    expect((await storedUpdateCheck(page)).skippedVersion).toBe('99.0.0')

    await page.getByTestId('update-undo-skip-button').click()

    await expect(page.getByTestId('update-hint')).toContainText('99.0.0')
    expect((await storedUpdateCheck(page)).skippedVersion).toBeNull()
  })

  test('does not notify about a skipped version on startup', async ({ page }) => {
    await mockUpdate(page, 200, '99.0.0')
    await setup(page)
    await page.addInitScript(() => {
      window.localStorage.setItem('updateCheck', JSON.stringify({ autoCheck: true, skippedVersion: '99.0.0', lastCheckedAt: null }))
    })
    await page.goto(SETTINGS_URL)

    await expect(page.getByTestId('update-available')).toContainText('99.0.0')
    await expect(page.getByTestId('update-hint')).toHaveCount(0)
  })

  test('sends no request when the automatic check is disabled', async ({ page }) => {
    const requests = await mockUpdate(page, 200, '99.0.0')
    await setup(page)
    await expect(page.getByTestId('update-hint')).toContainText('99.0.0')
    await page.addInitScript(() => {
      window.localStorage.setItem('updateCheck', JSON.stringify({ autoCheck: false, skippedVersion: null, lastCheckedAt: null }))
    })
    requests.length = 0
    await page.goto(SETTINGS_URL)

    await expect(page.getByTestId('update-status')).toHaveText('Not checked yet')
    await expect(page.getByTestId('settings-update-auto-check')).toHaveAttribute('aria-checked', 'false')
    expect(requests).toHaveLength(0)

    await page.getByTestId('update-check-button').click()

    await expect(page.getByTestId('update-status')).toContainText('99.0.0')
    expect(requests).toHaveLength(1)
  })

  test('persists the automatic check setting', async ({ page }) => {
    await mockUpdate(page, 204)
    await setup(page)
    await page.goto(SETTINGS_URL)

    await page.getByTestId('settings-update-auto-check').click()

    await expect.poll(async () => (await storedUpdateCheck(page))?.autoCheck).toBe(false)
  })
})
