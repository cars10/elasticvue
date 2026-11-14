import { expect, Page, test } from '@playwright/test'
import { setupClusterConnection } from '../../helpers.ts'
import { mockElastic8 } from '../../mocks/elastic_8/index.ts'

test.describe.configure({ mode: 'parallel' })

const mockShards = async (page: Page) => {
  await mockElastic8(page)
  await page.route(/_cat\/shards/, async (route) => {
    await route.fulfill({
      json: [
        { index: 'logs', shard: '0', prirep: 'p', state: 'STARTED', node: 'es-8-node-1', docs: '1', store: '1024' },
        { index: 'logs', shard: '0', prirep: 'r', state: 'UNASSIGNED', node: null, 'unassigned.reason': 'INDEX_CREATED' },
        { index: 'archive', shard: '0', prirep: 'p', state: 'STARTED', node: 'es-8-node-1', docs: '1', store: '1024' }
      ]
    })
  })
  await page.route(/_cat\/indices/, async (route) => {
    await route.fulfill({
      json: [
        { index: 'logs', health: 'yellow', status: 'open', pri: '1', rep: '1' },
        { index: 'archive', health: 'green', status: 'close', pri: '1', rep: '0' }
      ]
    })
  })
  await page.route(/_cat\/nodes/, async (route) => {
    await route.fulfill({ json: [{ name: 'es-8-node-1', 'node.role': 'd', version: '8.14.3' }] })
  })
}

test.describe('Shards', () => {
  test('shows indices as rows by default and toggles to nodes as rows', async ({ page }) => {
    await mockShards(page)
    await setupClusterConnection(page)
    await page.goto('http://localhost:5175/cluster/0/shards')

    const table = page.getByTestId('shards-table')
    await expect(table.locator('thead')).toContainText('es-8-node-1')
    await expect(table.locator('tbody tr').first()).toContainText('logs')
    await expect(table).not.toContainText('archive')

    await page.getByTestId('shards-rows').click()
    await expect(table.locator('thead')).toContainText('logs')
    await expect(table.locator('tbody')).toContainText('es-8-node-1')
    await expect(table).not.toContainText('archive')
  })
})
