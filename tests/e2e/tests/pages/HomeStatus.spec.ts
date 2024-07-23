import { test, expect } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { withElastic } from '../../mocks'

test.describe.configure({ mode: 'parallel' });

withElastic(({ mockElastic, elastic }) => {
  test.describe(`elasticsearch ${elastic.version}`, () => {
    test.describe('HomeStatus', () => {
      test('status card contains yellow', async ({ page }) => {
        await mockElastic(page, { health: 'yellow' })
        await setupClusterConnection(page)

        const card = page.getByTestId('cluster-status')
        await expect(card).toContainText('yellow')

        await page.getByTestId('cluster-unhealthy-details').click()

        const list = page.getByTestId('cluster-unhealthy-indices')
        await expect(list).toContainText('unhealthy-index')
      })

      test('node card contains node count', async ({ page }) => {
        await mockElastic(page)
        await setupClusterConnection(page)

        const card = page.getByTestId('cluster-nodes')
        await expect(card).toContainText('2 nodes')

        if (parseInt(elastic.version[0]) >= 5) {
          await expect(card).toContainText('2 master')
          await expect(card).toContainText('2 data')
        }
      })

      test('shards card contains shard count', async ({ page }) => {
        await mockElastic(page)
        await setupClusterConnection(page)

        const card = page.getByTestId('cluster-shards')
        await expect(card).toContainText('16 shards')
        await expect(card).toContainText('8 primaries')
        await expect(card).toContainText('8 replicas')
      })

      test('indices card contains index information', async ({ page }) => {
        await mockElastic(page)
        await setupClusterConnection(page)

        const card = page.getByTestId('cluster-indices')
        await expect(card).toContainText('8 indices')
        await expect(card).toContainText('174 docs')
        await expect(card).toContainText('86.1 MB on disk')
      })

      test('cluster information card', async ({ page }) => {
        await mockElastic(page)
        await setupClusterConnection(page)

        const card = page.getByTestId('cluster-information')
        await expect(card).toContainText(elastic.version)
      })

      test('cluster health card', async ({ page }) => {
        await mockElastic(page)
        await setupClusterConnection(page)

        const card = page.getByTestId('cluster-health')
        await expect(card).toContainText('green')
      })
    })
  })
})
