import { test, expect, Page } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { mockElastic8 } from '../../mocks/elastic_8'

test.describe.configure({ mode: 'parallel' })

const ES = 'http://localhost:9200/**'
const card = (page: Page) => page.getByTestId('cluster-unreachable')
const heading = (page: Page) => page.getByTestId('cluster-unreachable-heading')

const blockCors = (page: Page) =>
  page.route(ES, (route) =>
    route.request().headers().accept?.includes('application/json') ? route.abort('failed') : route.fulfill({ json: {} })
  )

test.describe('unreachable cluster', () => {
  test('explains network errors and connects on retry', async ({ page }) => {
    await page.route(ES, (route) => route.abort('connectionrefused'))
    await setupClusterConnection(page)

    await expect(card(page)).toBeVisible()
    await expect(heading(page)).toContainText("Can't reach default cluster")
    await expect(card(page)).toContainText('http://localhost:9200/')
    await expect(card(page)).not.toContainText('CORS')

    await page.unroute(ES)
    await mockElastic8(page)
    await page.getByTestId('cluster-unreachable-retry').click()

    await expect(page.getByTestId('cluster-status')).toBeVisible()
    await expect(card(page)).toHaveCount(0)
  })

  test('explains rejected credentials', async ({ page }) => {
    await page.route(ES, (route) =>
      route.fulfill({
        status: 401,
        json: { error: { type: 'security_exception', reason: 'missing authentication credentials' }, status: 401 }
      })
    )
    await setupClusterConnection(page)

    await expect(heading(page)).toContainText('default cluster rejected the credentials')
    await expect(page.getByTestId('cluster-unreachable-error')).toContainText('missing authentication credentials')
    await expect(card(page).getByTestId('cluster-edit')).toBeVisible()
  })

  test('shows other cluster errors', async ({ page }) => {
    await page.route(ES, (route) => route.fulfill({ status: 503, json: { error: { reason: 'no master' }, status: 503 } }))
    await setupClusterConnection(page)

    await expect(heading(page)).toContainText('default cluster returned an error')
    await expect(page.getByTestId('cluster-unreachable-error')).toContainText('503')
    await expect(page.getByTestId('cluster-unreachable-error')).toContainText('no master')
  })

  test('can open all clusters', async ({ page }) => {
    await page.route(ES, (route) => route.abort('connectionrefused'))
    await setupClusterConnection(page)

    await card(page).getByRole('link', { name: 'All clusters' }).click()
    await expect(page).toHaveURL(/\/clusters$/)
    await expect(page.getByRole('heading', { name: 'Clusters' })).toBeVisible()
  })

  test('explains blocked CORS requests', async ({ page }) => {
    await blockCors(page)
    await setupClusterConnection(page)

    await expect(heading(page)).toContainText('default cluster blocks requests from elasticvue')
    await expect(card(page)).toContainText('http.cors.enabled: true')
  })

  test('explains blocked CORS requests when adding a cluster', async ({ page }) => {
    await blockCors(page)
    await page.addInitScript(() => localStorage.clear())
    await page.goto('http://localhost:5175/welcome')
    await page.locator('#add_cluster').click()
    await page.getByRole('button', { name: 'Test connection' }).click()

    await expect(page.getByTestId('cluster-connection-cors')).toBeVisible()
  })
})
