import { test, expect, Page } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { mockOpensearch } from '../../mocks/opensearch'
import { mockElastic8 } from '../../mocks/elastic_8'

test.describe.configure({ mode: 'parallel' })

const mockRoot = async (page: Page, json: object) => {
  await page.route('http://localhost:9200/', (route) => route.fulfill({ json }))
}

const mockClusterHealth = async (page: Page, status: number) => {
  await page.route('http://localhost:9200/_cluster/health', (route) =>
    status === 200
      ? route.fulfill({ json: { cluster_name: 'x', status: 'green', number_of_nodes: 1 } })
      : route.fulfill({ status, json: { error: 'no handler found' } })
  )
}

const mockUnsupported = async (page: Page, root: object) => {
  await mockElastic8(page)
  await mockRoot(page, root)
  await mockClusterHealth(page, 404)
}

const storedCluster = (page: Page) =>
  page.evaluate(() => JSON.parse(window.localStorage.getItem('connection') as string).clusters[0])

const addCluster = async (page: Page) => {
  await page.addInitScript(() => localStorage.clear())
  await page.goto('http://localhost:5175/welcome')
  await page.locator('#add_cluster').click()
}

test.describe('OpenSearch', () => {
  for (const version of ['1.3.20', '2.19.7', '3.9.0']) {
    test(`is supported on ${version}`, async ({ page }) => {
      await mockOpensearch(version)(page)
      await setupClusterConnection(page)

      await expect(page.getByText(`OpenSearch ${version}`)).toBeVisible()
      await expect(page.getByTestId('unsupported-cluster')).toHaveCount(0)
      expect(await storedCluster(page)).toMatchObject({ distribution: 'opensearch', version, majorVersion: version.split('.')[0] })
    })

    test(`shows opensearch node roles on ${version}`, async ({ page }) => {
      await mockOpensearch(version)(page)
      await setupClusterConnection(page)
      await page.locator('#nodes').click()

      const table = page.getByTestId('nodes-table')
      await expect(table).toContainText('master')
      await expect(table).toContainText('ingest')
      await expect(table).not.toContainText('coordinating')
    })
  }

  test('hides elasticsearch only features', async ({ page }) => {
    await mockOpensearch('3.9.0')(page)
    await setupClusterConnection(page)

    await expect(page.locator('#indices')).toBeVisible()
    await expect(page.locator('#users')).toHaveCount(0)
    await expect(page.locator('#roles')).toHaveCount(0)
  })

  test('warns about unsupported major versions', async ({ page }) => {
    await mockOpensearch('4.0.0')(page)
    await setupClusterConnection(page)

    await expect(page.getByText('OpenSearch 4.0.0')).toBeVisible()
    await expect(page.getByTestId('unsupported-cluster').first()).toBeVisible()
  })
})

test.describe('Version parsing', () => {
  test('parses two digit elasticsearch major versions', async ({ page }) => {
    await mockElastic8(page)
    await mockRoot(page, { name: 'es-10', cluster_name: 'es-10', version: { number: '10.1.0' } })
    await setupClusterConnection(page)

    await expect(page.getByText('Elasticsearch 10.1.0')).toBeVisible()
    expect(await storedCluster(page)).toMatchObject({ distribution: 'elasticsearch', version: '10.1.0', majorVersion: '10' })
  })

  test('connects to products that report the version as string', async ({ page }) => {
    await mockUnsupported(page, { name: 'scope-node', version: '9.2.1' })
    await setupClusterConnection(page)

    await expect(page.getByTestId('cluster-unreachable')).toHaveCount(0)
    await expect(page.locator('#indices')).toBeVisible()
    await expect(page.getByTestId('unsupported-cluster').first()).toBeVisible()
    expect(await storedCluster(page)).toMatchObject({
      clusterName: 'scope-node',
      version: '9.2.1',
      majorVersion: '9',
      distribution: 'unknown'
    })
  })

  test('connects to other distributions', async ({ page }) => {
    await mockUnsupported(page, { name: 'n', cluster_name: 'easy', version: { distribution: 'easysearch', number: '1.9.0' } })
    await setupClusterConnection(page)

    await expect(page.getByText('Easysearch 1.9.0')).toBeVisible()
    await expect(page.getByTestId('unsupported-cluster').first()).toBeVisible()
  })

  test('can test and add an unsupported cluster', async ({ page }) => {
    await mockUnsupported(page, { name: 'scope-node', version: '9.2.1' })
    await page.route(/localhost:9200\/no_indices_match_this_pattern\*\/_search/, (route) =>
      route.fulfill({ status: 400, json: { error: 'unsupported' } })
    )
    await addCluster(page)

    await page.getByRole('button', { name: 'Test connection' }).click()
    await expect(page.getByText('Cluster is reachable')).toBeVisible()

    await page.getByRole('button', { name: 'Connect', exact: true }).click()
    await expect(page.locator('#indices')).toBeVisible()
    expect(await storedCluster(page)).toMatchObject({ clusterName: 'scope-node', majorVersion: '9', distribution: 'unknown' })
  })

  test('still fails the connection test for supported clusters', async ({ page }) => {
    await mockElastic8(page)
    await page.route(/localhost:9200\/no_indices_match_this_pattern\*\/_search/, (route) =>
      route.fulfill({ status: 400, json: { error: 'broken' } })
    )
    await addCluster(page)

    await page.getByRole('button', { name: 'Test connection' }).click()
    await expect(page.getByText('Cluster is reachable')).toHaveCount(0)
  })
})
