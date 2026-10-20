import { expect, Page, test } from '@playwright/test'
import { setupClusterConnection } from '../../helpers.ts'
import { mockElastic8 } from '../../mocks/elastic_8/index.ts'

test.describe.configure({ mode: 'parallel' })

const mockTools = async (page: Page, options: { settingsForbidden?: boolean; version?: string } = {}) => {
  let allocation = 'all'
  let lastSettingsBody: {
    persistent?: Record<string, string | number | boolean | null>
    transient?: Record<string, string | number | boolean | null>
  } | null = null
  let retriedFailed = false
  let shardRequests = 0

  await mockElastic8(page)
  if (options.version) {
    await page.route('http://localhost:9200/', async (route) => {
      await route.fulfill({
        json: {
          name: 'version-test-node',
          cluster_name: 'version-test',
          version: { number: options.version, build_flavor: 'default' }
        }
      })
    })
  }
  await page.route('**/_cluster/settings**', async (route) => {
    if (route.request().method() === 'PUT') {
      lastSettingsBody = route.request().postDataJSON() as typeof lastSettingsBody
      allocation = lastSettingsBody?.persistent?.['cluster.routing.allocation.enable'] ?? allocation
      await route.fulfill({ json: { acknowledged: true } })
      return
    }
    if (options.settingsForbidden) {
      await route.fulfill({
        status: 403,
        json: { error: { type: 'security_exception', reason: 'missing monitor privilege' }, status: 403 }
      })
      return
    }
    await route.fulfill({
      json: {
        persistent: {
          ...(allocation === 'all' ? {} : { 'cluster.routing.allocation.enable': allocation }),
          'cluster.routing.allocation.exclude._id': 'node-existing'
        },
        transient: {},
        defaults: {
          'cluster.routing.allocation.enable': 'all',
          'cluster.routing.allocation.disk.threshold_enabled': 'true',
          'cluster.routing.allocation.disk.watermark.low': '85%',
          'cluster.routing.allocation.disk.watermark.high': '90%',
          'cluster.routing.allocation.disk.watermark.flood_stage': '95%'
        }
      }
    })
  })
  await page.route('**/_cat/shards/**', async (route) => {
    shardRequests += 1
    await route.fulfill({
      json: [
        { index: 'logs', shard: '0', prirep: 'p', state: 'STARTED', node: 'es-8-node-1', store: '1024' },
        {
          index: 'logs',
          shard: '0',
          prirep: 'r',
          state: 'UNASSIGNED',
          node: null,
          'unassigned.reason': 'INDEX_CREATED'
        }
      ]
    })
  })
  await page.route('**/_nodes/stats/fs', async (route) => {
    await route.fulfill({
      json: {
        nodes: {
          'node-1': {
            name: 'es-8-node-1',
            roles: ['data'],
            fs: { total: { total_in_bytes: 1000, available_in_bytes: 400 } }
          }
        }
      }
    })
  })
  await page.route('**/_nodes', async (route) => {
    await route.fulfill({
      json: { nodes: { 'node-1': { name: 'es-8-node-1', roles: ['data'] } } }
    })
  })
  await page.route('**/_data_stream', async (route) => route.fulfill({ json: { data_streams: [] } }))
  await page.route('**/_all/_settings**', async (route) => {
    await route.fulfill({
      json: {
        logs: { settings: { 'index.number_of_replicas': '1' } }
      }
    })
  })
  await page.route('**/_cluster/reroute?retry_failed=true', async (route) => {
    retriedFailed = true
    await route.fulfill({ json: { acknowledged: true } })
  })
  await page.route(
    '**/_cluster/state/metadata?filter_path=metadata.cluster_coordination.voting_config_exclusions',
    async (route) => {
      await route.fulfill({ json: { metadata: { cluster_coordination: { voting_config_exclusions: [] } } } })
    }
  )

  return {
    lastSettingsBody: () => lastSettingsBody,
    retriedFailed: () => retriedFailed,
    shardRequests: () => shardRequests
  }
}

test.describe('Tools', () => {
  test('changes allocation persistently and retries failed allocations', async ({ page }) => {
    const state = await mockTools(page)
    await page.setViewportSize({ width: 1600, height: 1000 })
    await setupClusterConnection(page)

    await page.locator('#tools').click()
    await expect(page).toHaveURL(/\/cluster\/0\/tools/)
    await expect(page.getByTestId('tools-page')).toContainText('Common cluster maintenance and recovery operations.')
    await expect(page.getByTestId('tool-allocation').locator('.q-badge.bg-positive')).toHaveText('Normal')
    for (const title of [
      'Shard rebalancing',
      'Index refresh interval',
      'Recovery bandwidth',
      'Destructive operation protection',
      'Automatic index creation',
      'Cluster write mode',
      'Voting configuration exclusions',
      'Allocation awareness'
    ]) {
      await expect(page.getByText(title, { exact: true })).toBeVisible()
    }

    const drainHeightBefore = (await page.getByTestId('tool-drain').boundingBox())?.height
    expect(drainHeightBefore).toBeDefined()
    await page.getByText('Shard allocation', { exact: true }).click()
    await expect(page.locator('.q-dialog')).toHaveCount(1)
    await expect(page.locator('.tool-card__panel')).toBeVisible()
    await page.getByText('Elasticsearch APIs used', { exact: true }).click()
    await expect(page.getByText('PUT /_cluster/settings', { exact: true })).toBeVisible()
    const drainHeightAfter = (await page.getByTestId('tool-drain').boundingBox())?.height
    expect(drainHeightAfter).toBeDefined()
    expect(drainHeightAfter).toBe(drainHeightBefore)
    await page.getByLabel('Disabled — no new shard allocations').click()
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Disable allocation' }).click()
    await expect
      .poll(() => state.lastSettingsBody())
      .toMatchObject({
        persistent: { 'cluster.routing.allocation.enable': 'none' },
        transient: { 'cluster.routing.allocation.enable': null }
      })

    await page.getByLabel('Close Shard allocation').click()
    await page.getByText('Retry failed allocations', { exact: true }).click()
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Retry allocations' }).click()
    await expect.poll(() => state.retriedFailed()).toBe(true)
    await expect.poll(() => state.shardRequests()).toBeGreaterThanOrEqual(2)

    await page.getByLabel('Close Retry failed allocations').click()
    await page.getByText('Drain node', { exact: true }).click()
    await page.getByLabel('Node to drain').click()
    await page.getByRole('option', { name: /es-8-node-1/ }).click()
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Start drain' }).click()
    await expect
      .poll(() => state.lastSettingsBody())
      .toMatchObject({
        persistent: { 'cluster.routing.allocation.exclude._id': 'node-existing,node-1' },
        transient: { 'cluster.routing.allocation.exclude._id': null }
      })

    await page.getByLabel('Close Drain node').click()
    await page.getByText('Destructive operation protection', { exact: true }).click()
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByLabel('Require explicit index names').click()
    await expect
      .poll(() => state.lastSettingsBody())
      .toMatchObject({
        persistent: { 'action.destructive_requires_name': false },
        transient: { 'action.destructive_requires_name': null }
      })
    await expect(page.getByTestId('tools-page')).toContainText('Index write blocks')
  })

  test('keeps other tools available when cluster settings are forbidden', async ({ page }) => {
    await mockTools(page, { settingsForbidden: true })
    await setupClusterConnection(page)
    await page.locator('#tools').click()

    await page.getByText('Shard allocation', { exact: true }).click()
    await expect(page.getByText('Your Elasticsearch user does not have permission to inspect cluster settings.')).toBeVisible()
    await page.getByLabel('Close Shard allocation').click()

    await page.getByLabel('Search tools').fill('replica')
    await expect(page.getByText('Replicas', { exact: true })).toBeVisible()
    await expect(page.getByText('Explain unassigned shards', { exact: true })).toBeHidden()
  })

  test('hides tools unavailable in Elasticsearch 1.x', async ({ page }) => {
    await mockTools(page, { version: '1.7.6' })
    await setupClusterConnection(page)
    await page.locator('#tools').click()

    await expect(page.getByText('Shard allocation', { exact: true })).toBeVisible()
    await expect(page.getByText('Index refresh interval', { exact: true })).toBeVisible()
    await expect(page.getByText('Explain unassigned shards', { exact: true })).toBeHidden()
    await expect(page.getByText('Retry failed allocations', { exact: true })).toBeHidden()
    await expect(page.getByText('Voting configuration exclusions', { exact: true })).toBeHidden()
  })
})
