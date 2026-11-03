import { test, expect, Page } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { catIndices } from '../../mocks/elastic_8/indices'
import { buildSecurityRoles } from '../../mocks/default/users'

test.describe.configure({ mode: 'parallel' })

const mockServerless = async (page: Page) => {
  const unavailablePaths: string[] = []
  await page.route(/localhost:9200/, async (route) => {
    const url = new URL(route.request().url())
    unavailablePaths.push(url.pathname)
    await route.fulfill({
      status: 410,
      json: { error: { type: 'api_not_available_exception', reason: 'not available in serverless mode' }, status: 410 }
    })
  })
  await page.route('http://localhost:9200/', (route) =>
    route.fulfill({
      json: {
        name: 'serverless',
        cluster_name: 'serverless-test',
        version: { number: '9.7.0', build_flavor: 'serverless' }
      }
    })
  )
  await page.route(catIndices.url, (route) => route.fulfill({ json: catIndices.json }))
  await page.route(/localhost:9200\/_cat\/aliases\?/, (route) => route.fulfill({ json: [] }))
  await page.route(/localhost:9200\/_all\/_settings\?/, (route) => route.fulfill({ json: {} }))
  const roles = buildSecurityRoles('9.7.0')
  await page.route(roles.url, (route) => route.fulfill({ json: roles.json }))
  return unavailablePaths
}

const connect = async (page: Page) => {
  const unavailablePaths = await mockServerless(page)
  await setupClusterConnection(page)
  await expect(page.getByRole('link', { name: 'serverless mode' })).toBeVisible()
  return unavailablePaths
}

test.describe('Serverless', () => {
  test('hides pages that need unavailable apis', async ({ page }) => {
    const unavailablePaths = await connect(page)

    await expect(page.locator('#indices')).toBeVisible()
    await expect(page.locator('#search')).toBeVisible()
    for (const id of ['nodes', 'shards', 'tools', 'snapshots']) {
      await expect(page.locator(`#${id}`)).toHaveCount(0)
    }
    expect(unavailablePaths).not.toContain('/_cluster/health')
  })

  for (const path of ['nodes', 'shards', 'shards/recovery', 'tools', 'snapshot_repositories', 'users']) {
    test(`redirects /${path} to home`, async ({ page }) => {
      await connect(page)
      await page.evaluate((target) => {
        window.history.pushState({}, '', `/cluster/default-cluster/${target}`)
        window.dispatchEvent(new PopStateEvent('popstate'))
      }, path)

      await expect(page).toHaveURL(/\/cluster\/default-cluster$/)
      await expect(page.getByRole('link', { name: 'serverless mode' })).toBeVisible()
    })
  }

  test('allows roles route', async ({ page }) => {
    await connect(page)
    await page.evaluate(() => {
      window.history.pushState({}, '', '/cluster/default-cluster/roles')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    await expect(page.getByTestId('roles-table')).toContainText('read_only')
  })

  test('hides index actions that need unavailable apis', async ({ page }) => {
    await connect(page)
    await page.locator('#indices').click()
    const table = page.getByTestId('indices-table')
    await expect(table).toContainText('movies')

    await table.locator('tr', { hasText: 'movies' }).getByTestId('index-row-menu').click()
    const menu = page.locator('.q-menu')
    await expect(menu).toContainText('Show info')
    await expect(menu).toContainText('Refresh index')
    for (const text of ['Show stats', 'Clone', 'Forcemerge', 'Flush', 'Clear index cache', 'Close index', 'Open index']) {
      await expect(menu).not.toContainText(text)
    }
  })

  test('hides bulk index actions that need unavailable apis', async ({ page }) => {
    await connect(page)
    await page.locator('#indices').click()
    const table = page.getByTestId('indices-table')
    await expect(table).toContainText('movies')

    await table.locator('tr', { hasText: 'movies' }).locator('.q-checkbox').click()
    await page.getByRole('button', { name: 'Bulk Action' }).click()
    const menu = page.locator('.q-menu')
    await expect(menu).toContainText('Refresh index')
    for (const text of ['Forcemerge', 'Flush', 'Clear index cache', 'Close index', 'Open index']) {
      await expect(menu).not.toContainText(text)
    }
  })

  test('opens roles without loading users or role mappings', async ({ page }) => {
    const unavailablePaths = await connect(page)
    await page.locator('#users').click()

    await expect(page).toHaveURL(/\/roles$/)
    await expect(page.getByTestId('roles-table')).toContainText('read_only')
    await expect(page.locator('#users_list')).toHaveCount(0)
    expect(unavailablePaths.filter((path) => /_security\/(user|role_mapping)/.test(path))).toEqual([])
  })
})
