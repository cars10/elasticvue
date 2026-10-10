import { test, expect, Page } from '@playwright/test'
import { mockElastic8 } from '../mocks/elastic_8'

test.describe.configure({ mode: 'parallel' })

const mockDefaultClusters = async (page: Page, clusters: object[]) => {
  await page.route('**/api/default_clusters.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: clusters
    })
  })
}

const mockElasticAt = async (page: Page, baseUrl: string, clusterUuid: string) => {
  const origin = baseUrl.replace(/\/$/, '')

  await page.route(`${origin}/`, async (route) => {
    await route.fulfill({
      json: {
        name: 'es-node',
        cluster_name: 'es',
        cluster_uuid: clusterUuid,
        version: {
          number: '8.15.0',
          build_flavor: 'default',
          distribution: 'elasticsearch'
        }
      }
    })
  })

  await page.route(`${origin}/_cluster/health`, async (route) => {
    await route.fulfill({
      json: {
        cluster_name: 'es',
        status: 'green'
      }
    })
  })
}

const seedConnection = async (page: Page, connection: object) => {
  await page.addInitScript((state) => {
    window.localStorage.clear()
    window.localStorage.setItem('connection', JSON.stringify(state))
  }, connection)
}

const readConnection = async (page: Page) => {
  return page.evaluate(() => JSON.parse(window.localStorage.getItem('connection') as string))
}

const baseCluster = (overrides: Record<string, unknown>) => ({
  clusterName: '',
  version: '',
  majorVersion: '',
  distribution: 'elasticsearch',
  status: 'green',
  loading: false,
  flavor: 'default',
  auth: {
    authType: 'none',
    authData: {}
  },
  ...overrides
})

test.describe('predefined clusters', () => {
  test('reimports config, keeps uuid and manual clusters, REST works after switch', async ({ page }) => {
    await mockDefaultClusters(page, [
      { name: 'pre-a', uri: 'http://localhost:9200', username: 'elastic', password: 'secret' },
      { name: 'pre-b', uri: 'http://localhost:9201' }
    ])

    await seedConnection(page, {
      activeClusterIndex: 0,
      clusters: [
        baseCluster({
          name: 'pre-a',
          uri: 'http://localhost:9200',
          uuid: 'kept-uuid-a',
          status: 'green',
          version: '8.15.0',
          majorVersion: '8',
          predefined: true,
          auth: {
            authType: 'basicAuth',
            authData: { username: 'elastic', password: 'old-password' }
          }
        }),
        baseCluster({
          name: 'pre-b',
          uri: 'http://localhost:9201',
          uuid: 'kept-uuid-b',
          status: 'green',
          predefined: true
        }),
        baseCluster({
          name: 'manual cluster',
          uri: 'http://localhost:9200',
          uuid: 'manual-uuid',
          status: 'green',
          predefined: false
        })
      ]
    })

    await mockElastic8(page)
    await mockElasticAt(page, 'http://localhost:9201', 'other-cluster-uuid')
    await page.goto('/cluster/0/rest')

    const connection = await readConnection(page)
    expect(connection.clusters).toHaveLength(3)
    expect(connection.clusters[0].uuid).toBe('kept-uuid-a')
    expect(connection.clusters[0].auth).toEqual({
      authType: 'basicAuth',
      authData: { username: 'elastic', password: 'secret' }
    })
    expect(connection.clusters[1].uuid).toBe('kept-uuid-b')
    expect(connection.clusters[2]).toMatchObject({
      name: 'manual cluster',
      uuid: 'manual-uuid',
      predefined: false
    })

    await expect(page.locator('#send_request')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'REST' })).toBeVisible()

    await page.getByTestId('cluster-selection').click()
    await page.getByTestId('cluster-table-row-1').click()
    await page.waitForURL('**/cluster/1/**')

    await expect(page.locator('#send_request')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'REST' })).toBeVisible()

    const afterSwitch = await readConnection(page)
    expect(afterSwitch.clusters[1].uuid).toBe('kept-uuid-b')
    expect(afterSwitch.clusters.some((c: { name: string }) => c.name === 'manual cluster')).toBe(true)
  })

  test('shows REST after first health check when uuid was empty', async ({ page }) => {
    await mockDefaultClusters(page, [{ name: 'pre-a', uri: 'http://localhost:9200' }])

    await seedConnection(page, {
      activeClusterIndex: 0,
      clusters: [
        baseCluster({
          name: 'pre-a',
          uri: 'http://localhost:9200',
          uuid: '',
          status: '',
          predefined: true
        })
      ]
    })

    await mockElastic8(page)
    await page.goto('/cluster/0/rest')

    await expect(page.locator('#send_request')).toBeVisible()

    const connection = await readConnection(page)
    expect(connection.clusters[0].uuid).toBe('ecdKaffmR9WkFbKDW4PUWw')
  })
})
