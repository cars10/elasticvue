import { test, expect, Page } from '../fixtures'
import { APP, setupClusterConnection } from '../helpers'
import { mockElastic8 as mockElastic } from '../mocks/elastic_8'

test.describe.configure({ mode: 'parallel' })

const seedConnection = (page: Page, activeClusterId: string | null, clusters = ['first', 'second']) =>
  page.addInitScript(
    ({ activeClusterId, clusters }) => {
      window.localStorage.clear()
      window.localStorage.setItem(
        'connection',
        JSON.stringify({
          activeClusterId,
          clusters: clusters.map((id) => ({
            id,
            name: `${id} cluster`,
            uri: 'http://localhost:9200/',
            status: 'green',
            clusterName: '',
            version: '',
            majorVersion: '',
            distribution: 'elasticsearch',
            flavor: 'default',
            auth: { authType: 'none', authData: {} }
          }))
        })
      )
    },
    { activeClusterId, clusters }
  )

test.describe('Routing', () => {
  test.describe('empty state', () => {
    const expectWelcomePage = async (page: Page) => {
      await expect(page).toHaveURL(/\/welcome$/)
      await expect(page.getByRole('heading', { name: 'elasticvue' })).toBeVisible()
      await expect(page.locator('#add_cluster')).toBeVisible()
    }

    for (const path of ['/', '/foo', '/cluster/42', '/welcome']) {
      test(`${path} shows the welcome page`, async ({ page }) => {
        await page.goto(`${APP}${path}`)
        await expectWelcomePage(page)
      })
    }

    test('root redirects to welcome if no cluster exists', async ({ page }) => {
      await seedConnection(page, null, [])
      await page.goto(APP)
      await expectWelcomePage(page)
    })
  })

  test.describe('existing connections', () => {
    test.beforeEach(async ({ page }) => {
      await mockElastic(page)
    })

    test('root redirects to the active cluster', async ({ page }) => {
      await seedConnection(page, 'second')
      await page.goto(APP)
      await expect(page).toHaveURL(/\/cluster\/second$/)
    })

    test('root redirects to the first cluster if the active cluster is missing', async ({ page }) => {
      await seedConnection(page, 'missing')
      await page.goto(APP)
      await expect(page).toHaveURL(/\/cluster\/first$/)
    })

    test('welcome redirects to the current cluster', async ({ page }) => {
      await setupClusterConnection(page)
      await page.goto(`${APP}/welcome`)
      await expect(page).toHaveURL(/\/cluster\/default-cluster$/)
    })

    test('opens pages of other clusters and redirects old index urls', async ({ page }) => {
      await setupClusterConnection(page)

      await page.goto(`${APP}/cluster/dev-cluster/indices`)
      await expect(page).toHaveURL(/\/cluster\/dev-cluster\/indices$/)

      await page.goto(`${APP}/cluster/0`)
      await expect(page).toHaveURL(/\/cluster\/default-cluster$/)

      await page.goto(`${APP}/cluster/1/indices`)
      await expect(page).toHaveURL(/\/cluster\/dev-cluster\/indices$/)
    })

    test('redirect_to_cluster selects the cluster by name, ignoring case', async ({ page }) => {
      await setupClusterConnection(page)

      await page.goto(`${APP}/redirect_to_cluster?name=unknown-cluster`)
      await expect(page).toHaveURL(/\/cluster\/default-cluster$/)

      await page.goto(`${APP}/redirect_to_cluster?name=dev%20cluster`)
      await expect(page).toHaveURL(/\/cluster\/dev-cluster$/)

      await page.goto(`${APP}/redirect_to_cluster?name=DEFAULT%20CLUSTER`)
      await expect(page).toHaveURL(/\/cluster\/default-cluster$/)
    })

    test('redirects unknown cluster ids to the active cluster', async ({ page }) => {
      await setupClusterConnection(page)

      for (const value of ['42', 'true', 'hello', 'null']) {
        await page.goto(`${APP}/cluster/${value}`)
        await expect(page).toHaveURL(/\/cluster\/default-cluster$/)
      }
    })
  })
})
