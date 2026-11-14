import { test, expect } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { withElastic } from '../../mocks'
import { mockElastic8 } from '../../mocks/elastic_8'

test.describe.configure({ mode: 'parallel' })

test.describe('HomeStatus', () => {
  test('shows yellow status and the unhealthy index', async ({ page }) => {
    await mockElastic8(page, { health: 'yellow' })
    await setupClusterConnection(page)

    await expect(page.getByTestId('cluster-status')).toContainText('Yellow')
    await expect(page.getByTestId('cluster-status')).toContainText('2 unassigned shards')
    await expect(page.getByTestId('cluster-indices')).toContainText('unhealthy-index')
  })

  test('shows the error when cluster stats cannot be loaded', async ({ page }) => {
    await mockElastic8(page)
    await page.route('**/_cluster/stats**', (route) =>
      route.fulfill({ status: 403, json: { error: { type: 'security_exception', reason: 'missing monitor privilege' } } })
    )
    await setupClusterConnection(page)

    await expect(page.getByText('missing monitor privilege')).toBeVisible()
    await expect(page.getByTestId('cluster-status')).toBeHidden()
  })

  test('marks sample based checks as collecting data and loads largest indices client side', async ({ page }) => {
    await mockElastic8(page)
    const indexRequests: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('/_cat/indices')) indexRequests.push(request.url())
    })
    await setupClusterConnection(page)

    const attention = page.getByTestId('cluster-attention')
    await attention.click()
    await expect(attention).toContainText('Collecting data')
    expect(indexRequests.some((url) => new URL(url).searchParams.has('s'))).toBe(false)
  })

  withElastic(({ mockElastic, elastic }) => {
    test(`shows the cluster overview on ${elastic.version}`, async ({ page }) => {
      await mockElastic(page)
      await setupClusterConnection(page)

      await expect(page.getByTestId('cluster-status')).toContainText('Green')
      await expect(page.getByText(new RegExp(`(Elasticsearch|OpenSearch) ${elastic.version}`))).toBeVisible()

      const nodes = page.getByTestId('cluster-nodes-summary')
      await expect(nodes).toContainText('2 nodes')
      if (parseInt(elastic.version[0]) >= 5) {
        await expect(nodes).toContainText('2 data')
        await expect(nodes).toContainText('2 master-eligible')
      }

      const indices = page.getByTestId('cluster-indices-summary')
      await expect(indices).toContainText('8 indices')
      await expect(indices).toContainText('174 documents')
      await expect(indices).toContainText('86.1 MB on disk')

      const tasks = page.getByTestId('cluster-tasks')
      if (elastic.node.startsWith('es-1-')) {
        await expect(tasks).toContainText('Not supported by this cluster version')
      } else {
        await expect(tasks).toContainText('1 running')
        await expect(tasks).toContainText('1 task running for more than a minute')
      }
    })
  })
})
