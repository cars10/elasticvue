import { expect, Page, test } from '../../fixtures'
import { setupClusterConnection } from '../../helpers.ts'
import { mockElastic8 } from '../../mocks/elastic_8/index.ts'

test.describe.configure({ mode: 'parallel' })

const mockTools = async (page: Page, options: { settingsForbidden?: boolean; version?: string } = {}) => {
  let allocation = 'all'
  let excluded = 'node-existing'
  let lastSettingsBody: {
    persistent?: Record<string, string | number | boolean | null>
    transient?: Record<string, string | number | boolean | null>
  } | null = null
  let retriedFailed = false
  let flushed = false
  let votingExclusions: Array<{ node_id: string; node_name: string }> = []
  let votingCleared = false
  let shardRequests = 0
  const health = { status: 'yellow', number_of_nodes: 2, number_of_data_nodes: 2, unassigned_shards: 2, initializing_shards: 0 }

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
      const persistent = lastSettingsBody?.persistent || {}
      if ('cluster.routing.allocation.enable' in persistent) allocation = String(persistent['cluster.routing.allocation.enable'] ?? 'all')
      if ('cluster.routing.allocation.exclude._id' in persistent) excluded = String(persistent['cluster.routing.allocation.exclude._id'])
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
          'cluster.routing.allocation.exclude._id': excluded
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
  await page.route('**/_cat/allocation**', async (route) => {
    const drained = excluded.split(',').includes('node-1')
    await route.fulfill({
      json: [
        { node: 'es-8-node-1', shards: drained ? '0' : '1', 'disk.avail': '400', 'disk.percent': '60' },
        { node: 'es-8-node-2', shards: drained ? '1' : '0', 'disk.avail': '100000', 'disk.percent': '10' },
        { node: 'UNASSIGNED', shards: '1' }
      ]
    })
  })
  await page.route('**/_nodes?**', async (route) => {
    await route.fulfill({
      json: {
        nodes: {
          'node-1': { name: 'es-8-node-1', roles: ['data', 'master'] },
          'node-2': { name: 'es-8-node-2', roles: ['data', 'master'] }
        }
      }
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
  await page.route('**/_cluster/health', async (route) => {
    await route.fulfill({
      json: { ...health, active_primary_shards: 1, active_shards: 1, relocating_shards: 0, unassigned_primary_shards: 0 }
    })
  })
  await page.route('**/_all/_flush', async (route) => {
    flushed = true
    await route.fulfill({ json: { _shards: { total: 1, successful: 1, failed: 0 } } })
  })
  await page.route(
    '**/_cluster/state/metadata?filter_path=metadata.cluster_coordination.voting_config_exclusions',
    async (route) => {
      await route.fulfill({ json: { metadata: { cluster_coordination: { voting_config_exclusions: votingExclusions } } } })
    }
  )
  await page.route('**/_cluster/voting_config_exclusions?**', async (route) => {
    if (route.request().method() === 'DELETE') {
      votingCleared = true
      votingExclusions = []
    } else {
      votingExclusions = [{ node_id: 'node-1', node_name: 'es-8-node-1' }]
    }
    await route.fulfill({ status: 200, body: '' })
  })

  return {
    lastSettingsBody: () => lastSettingsBody,
    retriedFailed: () => retriedFailed,
    flushed: () => flushed,
    votingExclusions: () => votingExclusions,
    votingCleared: () => votingCleared,
    shardRequests: () => shardRequests,
    health
  }
}

test.describe('Tools', () => {
  test('changes cluster settings persistently', async ({ page }) => {
    const state = await mockTools(page)
    await setupClusterConnection(page)

    await page.locator('#tools').click()
    await expect(page).toHaveURL(/\/cluster\/default-cluster\/tools/)
    await expect(page.getByTestId('tool-allocation').getByTestId('tool-status')).toHaveText('All shards')
    await page.getByText('Shard allocation', { exact: true }).click()
    await expect(page.locator('.tool-panel')).toBeVisible()
    await expect(page).toHaveURL(/tool=allocation/)
    await page.getByLabel('Disabled - no new allocations').click()
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Disable allocation' }).click()
    await expect
      .poll(() => state.lastSettingsBody())
      .toMatchObject({
        persistent: { 'cluster.routing.allocation.enable': 'none' },
        transient: { 'cluster.routing.allocation.enable': null }
      })

    await page.getByLabel('Close Shard allocation').click()
    await page.getByText('Destructive operation protection', { exact: true }).click()
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByLabel('Require explicit index names').click()
    await expect
      .poll(() => state.lastSettingsBody())
      .toMatchObject({
        persistent: { 'action.destructive_requires_name': false },
        transient: { 'action.destructive_requires_name': null }
      })
  })

  test('loads shards only when a tool needs them', async ({ page }) => {
    const state = await mockTools(page)
    await setupClusterConnection(page)
    await page.locator('#tools').click()

    await expect(page.getByTestId('tool-unassigned').getByTestId('tool-status')).toContainText('2 unassigned shards')
    expect(state.shardRequests()).toBe(0)

    await page.getByTestId('tool-unassigned').click()
    await expect.poll(() => state.shardRequests()).toBe(1)
  })

  test('opens the matching tool from the home attention checks', async ({ page }) => {
    await mockTools(page)
    await setupClusterConnection(page)

    await page.getByTestId('cluster-attention').click()
    await page.getByTestId('attention-tool-shards').click()
    await expect(page).toHaveURL(/\/tools\?tool=unassigned/)
    await expect(page.getByTestId('tool-panel-unassigned')).toBeVisible()
  })

  test('explains unassigned shards, retries and verifies the result', async ({ page }) => {
    const state = await mockTools(page)
    await page.route('**/_cluster/allocation/explain**', (route) =>
      route.fulfill({
        json: {
          index: 'logs',
          shard: 0,
          primary: false,
          current_state: 'unassigned',
          unassigned_info: { reason: 'ALLOCATION_FAILED' },
          can_allocate: 'no',
          allocate_explanation: 'cannot allocate',
          node_allocation_decisions: []
        }
      })
    )
    await setupClusterConnection(page)
    await page.locator('#tools').click()
    await page.getByTestId('tool-unassigned').click()

    const panel = page.getByTestId('tool-panel-unassigned')
    await expect(panel).toContainText('2 shards are unassigned')
    await panel.getByRole('button', { name: 'Continue' }).click()
    await panel.locator('.q-select').click()
    await page.getByRole('option').first().click()
    await panel.getByRole('button', { name: 'Explain', exact: true }).click()
    await panel.getByText('Raw response').click()
    await expect(panel.locator('.tool-json .cm-content')).toContainText('"allocate_explanation": "cannot allocate"')
    await panel.getByRole('button', { name: 'Continue' }).click()

    const retry = panel.getByTestId('remedy-retry')
    await expect(retry).toContainText('Recommended')
    state.health.unassigned_shards = 0
    page.once('dialog', (dialog) => dialog.accept())
    await retry.getByRole('button', { name: 'Retry allocations' }).click()
    await expect.poll(() => state.retriedFailed()).toBe(true)
    await expect(panel).toContainText('All shards are assigned. 2 were unassigned before.')
  })

  test('removes a master eligible node and cleans up afterwards', async ({ page }) => {
    const state = await mockTools(page)
    await setupClusterConnection(page)
    await page.locator('#tools').click()
    await page.getByTestId('tool-remove-node').click()

    const panel = page.getByTestId('tool-panel-remove_node')
    await panel.getByLabel('Node', { exact: true }).click()
    await page.getByRole('option', { name: /es-8-node-1/ }).click()
    await expect(panel).not.toContainText('There is no other data node')
    await panel.getByRole('button', { name: 'Continue' }).click()
    page.once('dialog', (dialog) => dialog.accept())
    await panel.getByRole('button', { name: 'Start drain' }).click()
    await expect
      .poll(() => state.lastSettingsBody())
      .toMatchObject({
        persistent: { 'cluster.routing.allocation.exclude._id': 'node-existing,node-1' },
        transient: { 'cluster.routing.allocation.exclude._id': null }
      })
    await expect(panel).toContainText('No shards left on this node')

    page.once('dialog', (dialog) => dialog.accept())
    await panel.getByRole('button', { name: 'Remove from voting configuration' }).click()
    await expect(panel).toContainText('The node is excluded from the voting configuration.')
    expect(state.votingExclusions()).toEqual([{ node_id: 'node-1', node_name: 'es-8-node-1' }])

    page.once('dialog', (dialog) => dialog.accept())
    await panel.getByRole('button', { name: 'Remove exclusions' }).click()
    await expect
      .poll(() => state.lastSettingsBody())
      .toMatchObject({ persistent: { 'cluster.routing.allocation.exclude._id': 'node-existing' } })
    await expect.poll(() => state.votingCleared()).toBe(true)
  })

  test('guides through a rolling restart', async ({ page }) => {
    const state = await mockTools(page)
    state.health.status = 'green'
    await setupClusterConnection(page)
    await page.locator('#tools').click()
    await page.getByTestId('tool-restart').click()

    const panel = page.getByTestId('tool-panel-restart')
    await panel.getByRole('button', { name: 'Continue' }).click()
    page.once('dialog', (dialog) => dialog.accept())
    await panel.getByRole('button', { name: 'Pause replica allocation' }).click()
    await expect
      .poll(() => state.lastSettingsBody())
      .toMatchObject({ persistent: { 'cluster.routing.allocation.enable': 'primaries' } })

    await panel.getByRole('button', { name: 'Flush all indices' }).click()
    await expect.poll(() => state.flushed()).toBe(true)
    await expect(panel.getByTestId('restart-nodes')).toHaveText('Nodes in the cluster: 2 of 2.')
    await panel.getByRole('button', { name: 'The node is back' }).click()
    await panel.getByRole('button', { name: 'Enable allocation' }).click()
    await expect
      .poll(() => state.lastSettingsBody())
      .toMatchObject({
        persistent: { 'cluster.routing.allocation.enable': null },
        transient: { 'cluster.routing.allocation.enable': null }
      })
    await expect(panel).toContainText('The cluster is green')
  })

  test('resumes a rolling restart when replica allocation is paused', async ({ page }) => {
    await mockTools(page)
    await page.route('**/_cluster/settings**', (route) =>
      route.fulfill({ json: { persistent: { 'cluster.routing.allocation.enable': 'primaries' }, transient: {}, defaults: {} } })
    )
    await setupClusterConnection(page)
    await page.locator('#tools').click()
    await expect(page.getByTestId('tool-restart').getByTestId('tool-status')).toHaveText('Replica allocation paused')
    await page.getByTestId('tool-restart').click()
    await expect(page.getByTestId('tool-panel-restart').getByRole('button', { name: 'The node is back' })).toBeVisible()
  })

  test('clears a cluster write block and verifies writes', async ({ page }) => {
    let readOnly = true
    let lastBody: { persistent?: Record<string, unknown> } | null = null
    await mockTools(page)
    await page.route('**/_cluster/settings**', async (route) => {
      if (route.request().method() === 'PUT') {
        lastBody = route.request().postDataJSON()
        readOnly = Boolean(lastBody?.persistent?.['cluster.blocks.read_only'])
        await route.fulfill({ json: { acknowledged: true } })
        return
      }
      await route.fulfill({ json: { persistent: { 'cluster.blocks.read_only': String(readOnly) }, transient: {}, defaults: {} } })
    })
    await setupClusterConnection(page)
    await page.locator('#tools').click()
    await expect(page.getByTestId('tool-writes').getByTestId('tool-status')).toContainText('1 block')
    await page.getByTestId('tool-writes').click()

    const panel = page.getByTestId('tool-panel-writes')
    await expect(panel.getByTestId('writes-findings')).toContainText('The whole cluster is')
    await panel.getByRole('button', { name: 'Continue' }).click()
    page.once('dialog', (dialog) => dialog.accept())
    await panel.getByRole('button', { name: 'Make the cluster writable' }).click()
    await expect.poll(() => lastBody).toMatchObject({ persistent: { 'cluster.blocks.read_only': false } })
    await panel.getByRole('button', { name: 'Check result' }).click()
    await expect(panel).toContainText('The cluster and all user indices accept writes again.')
  })

  test('changes replicas of selected indices', async ({ page }) => {
    await mockTools(page)
    let body: unknown = null
    await page.route('**/logs/_settings', async (route) => {
      body = route.request().postDataJSON()
      await route.fulfill({ json: { acknowledged: true } })
    })
    await setupClusterConnection(page)
    await page.locator('#tools').click()
    await page.getByTestId('tool-index-settings').click()

    const panel = page.getByTestId('tool-panel-index_settings')
    await panel.getByLabel('Indices').click()
    await page.getByRole('option', { name: 'logs (1)' }).click()
    await page.keyboard.press('Escape')
    await panel.getByRole('spinbutton', { name: 'Replicas' }).fill('2')
    page.once('dialog', (dialog) => dialog.accept())
    await panel.getByRole('button', { name: 'Apply' }).click()
    await expect.poll(() => body).toEqual({ index: { number_of_replicas: 2 } })
  })

  test('keeps other tools available when cluster settings are forbidden', async ({ page }) => {
    await mockTools(page, { settingsForbidden: true })
    await setupClusterConnection(page)
    await page.locator('#tools').click()
    await expect(page.getByTestId('tools-page')).toBeVisible()

    await page.getByText('Shard allocation', { exact: true }).click()
    await expect(page.getByText('Your user is not allowed to read cluster settings.')).toBeVisible()
    await page.getByLabel('Close Shard allocation').click()

    const filter = page.getByLabel('Filter tools')
    await filter.fill('replica')
    await expect(page.getByText('Index settings', { exact: true })).toBeVisible()
    await expect(page.getByText('Destructive operation protection', { exact: true })).toBeHidden()
    await filter.press('Escape')
    await expect(page.getByText('Destructive operation protection', { exact: true })).toBeVisible()
  })

  test('skips steps unavailable in Elasticsearch 1.x', async ({ page }) => {
    await mockTools(page, { version: '1.7.6' })
    await setupClusterConnection(page)
    await page.locator('#tools').click()

    await page.getByTestId('tool-unassigned').click()
    const panel = page.getByTestId('tool-panel-unassigned')
    await expect(panel.getByText('Explain a shard')).toBeHidden()
    await panel.getByRole('button', { name: 'Continue' }).click()
    await expect(panel.getByTestId('remedy-retry')).toBeHidden()
  })
})
