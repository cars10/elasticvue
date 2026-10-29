import { test, expect, Page } from '@playwright/test'
import { setupClusterConnection } from '../helpers'
import { mockElastic8 as mockElastic } from '../mocks/elastic_8'

test.describe.configure({ mode: 'parallel' })

test.describe('Routing', () => {
  test.describe('empty state', () => {
    const expectWelcomePage = async (page: Page) => {
      expect(page.url()).toContain('/welcome')
      await expect(page.getByRole('heading', { name: 'elasticvue' })).toBeVisible()
      await expect(page.locator('#add_cluster')).toBeVisible()
    }

    test('redirects to /welcome', async ({ page }) => {
      await page.goto('http://localhost:5175/')
      await expectWelcomePage(page)
    })

    test('wrong url redirects to /welcome', async ({ page }) => {
      await page.goto('http://localhost:5175/foo')
      await expectWelcomePage(page)
    })

    test('wrong cluster id redirects to /welcome', async ({ page }) => {
      await page.goto('http://localhost:5175/cluster/42')
      await expectWelcomePage(page)
    })

    test('can open /welcome', async ({ page }) => {
      await page.goto('http://localhost:5175/welcome')
      await expectWelcomePage(page)
    })
  })

  test.describe('existing connections', () => {
    test.beforeEach(async ({ page }) => {
      await mockElastic(page)
    })

    test('does not redirect to /welcome', async ({ page }) => {
      await setupClusterConnection(page)
      expect(page.url()).not.toContain('/welcome')
    })

    test('cannot open /welcome', async ({ page }) => {
      await setupClusterConnection(page)
      await page.goto('http://localhost:5175/welcome')
      expect(page.url()).not.toContain('/welcome')
    })

    test('welcome redirects to current cluster if cluster is correct', async ({ page }) => {
      await setupClusterConnection(page)
      await page.goto('http://localhost:5175/welcome')
      expect(page.url()).toContain('/cluster/0')
    })

    test('root redirects to current cluster if cluster is correct', async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.clear()

        const connection = {
          clusters: [
            {
              name: 'default cluster',
              username: '',
              password: '',
              uri: 'http://localhost:9200',
              status: 'green'
            },
            {
              name: 'dev cluster',
              username: '',
              password: '',
              uri: 'http://localhost:9200',
              status: 'green'
            }
          ],
          activeClusterIndex: 1
        }
        window.localStorage.setItem('connection', JSON.stringify(connection))
      })

      await page.goto('http://localhost:5175')
      expect(page.url()).toContain('/cluster/1')
    })

    test('root redirects to first cluster if cluster is wrong', async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.clear()

        const connection = {
          clusters: [
            {
              name: 'default cluster',
              username: '',
              password: '',
              uri: 'http://localhost:9200',
              status: 'green'
            },
            {
              name: 'dev cluster',
              username: '',
              password: '',
              uri: 'http://localhost:9200',
              status: 'green'
            }
          ],
          activeClusterIndex: 1337
        }
        window.localStorage.setItem('connection', JSON.stringify(connection))
      })

      await page.goto('http://localhost:5175')
      expect(page.url()).toContain('/cluster/0')
    })

    test('root redirects to welcome if no cluster exists', async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.clear()

        const connection = {
          clusters: [],
          activeClusterIndex: 0
        }
        window.localStorage.setItem('connection', JSON.stringify(connection))
      })

      await page.goto('http://localhost:5175')
      expect(page.url()).toContain('/welcome')
    })

    test('can access existing clusters', async ({ page }) => {
      await setupClusterConnection(page)

      await page.goto('http://localhost:5175/cluster/0')
      expect(page.url()).toContain('/cluster/0')

      await page.goto('http://localhost:5175/cluster/1')
      expect(page.url()).toContain('/cluster/1')
    })

    test('redirect_to_cluster selects cluster by name', async ({ page }) => {
      await setupClusterConnection(page)

      await page.goto('http://localhost:5175/redirect_to_cluster?name=dev%20cluster')
      await page.waitForURL('**/cluster/1')
      expect(page.url()).toContain('/cluster/1')
    })

    test('redirect_to_cluster is case-insensitive', async ({ page }) => {
      await setupClusterConnection(page)

      await page.goto('http://localhost:5175/redirect_to_cluster?name=DEFAULT%20CLUSTER')
      await page.waitForURL('**/cluster/0')
      expect(page.url()).toContain('/cluster/0')
    })

    test('redirect_to_cluster falls back when no cluster matches', async ({ page }) => {
      await setupClusterConnection(page)

      await page.goto('http://localhost:5175/redirect_to_cluster?name=unknown-cluster')
      await page.waitForURL('**/cluster/0')
      expect(page.url()).toContain('/cluster/0')
    })

    test('redirects for non-existing clusters', async ({ page }) => {
      await setupClusterConnection(page)

      const invalids = [42, '42', true, 'true', 'hello', null, '']

      for (const value of invalids) {
        await page.goto(`http://localhost:5175/cluster/${value}`)
        await page.waitForURL('**/cluster/0')
        expect(page.url()).toContain('/cluster/0')
      }
    })
  })
})
