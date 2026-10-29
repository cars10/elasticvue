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
    })
  })
})
