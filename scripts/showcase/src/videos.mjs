import { exact, open, settle, t } from './browser.mjs'
import { CLUSTERS, es, waitForGreen } from './elasticsearch.mjs'

export const indexRow = (page, name) => page.getByTestId('indices-table').getByRole('row').filter({ has: exact(page, name) })
export const elasticsearchResponse = (page) => page.waitForResponse((response) => response.url().startsWith('http://es-'))
export const warmup = Number(process.env.DASHBOARD_WARMUP || 60)

const shards = {
  prepare: async (page) => {
    await open(page, 'shards')
    await page.getByTestId('problem-shards').waitFor()
    await settle(page)
  },
  act: async (page, user) => {
    await user.pause(1500)
    await user.hover([page.getByTestId('shards-pulse-unassigned'), page.getByTestId('shards-pulse-balance')], 1200)
    await user.hover([page.getByTestId('problem-shards').locator('tbody tr').first()], 1500)
    await user.move(page.getByTestId('shards-table'))
    await user.pause(1500)
    await user.click(page.getByTestId('shards-rows'))
    await settle(page, 2500)
    await user.click(page.getByTestId('shards-rows'))
    await settle(page, 2000)
  }
}

const pickOption = async (page, user, field, name) => {
  await user.click(field)
  await user.pause(500)
  await user.click(page.getByRole('option').filter({ hasText: name }).first())
}

const archiveReplicas = (count) =>
  es(CLUSTERS.production.nodes[0], 'archive-2024/_settings', { method: 'PUT', body: { index: { number_of_replicas: count } } })

const tools = {
  prepare: async (page) => {
    await archiveReplicas(1)
    await waitForGreen('production')
    await open(page, 'tools')
    await page.getByTestId('tool-remove-node').waitFor()
    await settle(page)
  },
  act: async (page, user) => {
    await user.pause(1500)
    for (const id of ['unassigned', 'remove-node', 'restart']) await user.hover([page.getByTestId(`tool-${id}`)], 900)

    await user.click(page.getByTestId('tool-remove-node'))
    const panel = page.getByTestId('tool-panel-remove_node')
    await panel.waitFor()
    await settle(page, 1000)
    await pickOption(page, user, panel.getByLabel(t('tools.drain.node'), { exact: true }), 'production-3')
    await user.pause(2000)
    await user.click(panel.getByRole('button', { name: t('tools.steps.continue'), exact: true }))
    await user.pause(1500)
    await user.click(panel.getByRole('button', { name: t('tools.drain.start'), exact: true }))
    await user.move(panel.locator('.q-linear-progress'))
    await panel.getByText(t('tools.drain.done')).waitFor({ timeout: 180000 })
    await user.pause(2500)

    await user.click(panel.getByRole('button', { name: t('tools.drain.voting_add'), exact: true }))
    await panel.getByText(t('tools.drain.voting_done')).waitFor()
    await user.pause(2500)
    await user.click(panel.getByRole('button', { name: t('tools.drain.cleanup'), exact: true }))
    await settle(page, 1500)
    await page.keyboard.press('Escape')
    await user.pause(2000)
    await archiveReplicas(3)
  }
}

const indices = {
  prepare: async (page) => {
    await open(page, 'indices')
    await indexRow(page, 'movies').waitFor()
    await settle(page)
  },
  act: async (page, user) => {
    const rows = page.getByTestId('indices-table').getByRole('row')
    await user.pause(1500)
    await user.hover([rows.nth(2), rows.nth(4), rows.nth(6)], 700)

    await user.click(indexRow(page, 'movies').getByTestId('index-row-menu'))
    await user.pause(800)
    await user.click(page.locator('.q-menu').getByText(t('indices.index_aliases.text'), { exact: true }))

    const dialog = page.getByRole('dialog')
    await user.pause(800)
    await user.type(dialog.getByLabel(t('indices.index_aliases.form.new_alias.label')), 'films')
    await user.click(dialog.getByRole('button', { name: t('indices.index_aliases.form.add_alias') }))
    await dialog.getByRole('cell', { name: 'films', exact: true }).waitFor()
    await user.pause(1500)
    await user.click(dialog.getByRole('button', { name: t('defaults.close'), exact: true }))

    await indexRow(page, 'movies').getByText('films').waitFor()
    await user.move(indexRow(page, 'movies'))
    await user.pause(3000)
  }
}

const search = {
  prepare: async (page) => {
    await open(page, 'search')
    await page.getByTestId('search-result').first().waitFor()
    await settle(page)
  },
  act: async (page, user) => {
    await user.pause(1500)

    await user.click(page.getByTestId('search-target-chip').first().locator('.q-chip__icon--remove'))
    await user.type(page.getByTestId('search-targets'), 'logs-*')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Escape')
    await settle(page)

    await user.click(page.getByTestId('search-time-range'))
    await user.click(page.getByTestId('search-time-preset').filter({ hasText: t('search.time.presets.last_24h') }))
    await settle(page, 1500)

    const query = page.getByTestId('search-query')
    await user.click(query)
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.press('Backspace')
    for (const [typed, pick] of [
      ['lev', 'level'],
      ['err', 'error'],
      ['AN', 'AND'],
      ['ser', 'service'],
      ['pay', 'payments']
    ]) {
      await query.pressSequentially(typed, { delay: 160 })
      const suggestion = page.getByTestId('search-query-suggestion').filter({ hasText: pick }).first()
      await suggestion.waitFor()
      await user.pause(1100)
      await user.click(suggestion)
      await user.pause(400)
    }
    await user.pause(600)
    await query.press('Enter')
    await settle(page, 2000)

    await user.click(page.getByTestId('search-result').first().locator('td').nth(3))
    const panel = page.getByTestId('search-document-panel')
    await panel.waitFor()
    await user.pause(1500)
    const region = panel.getByTestId('search-panel-field').filter({ has: exact(page, 'region') })
    await user.move(region)
    await user.click(region.getByTestId('search-panel-filter-for'))
    await user.pause(800)
    if (await panel.isVisible()) await user.click(panel.getByTitle(t('defaults.close')))
    await page.getByTestId('search-filter-chip').first().waitFor()
    await settle(page, 2000)
    await user.click(page.getByTestId('search-histogram-toggle'))
    await settle(page, 2500)

    await user.click(page.getByTestId('search-mode').getByText(t('search.form.mode.sql'), { exact: true }))
    const sql = page.getByTestId('search-sql-query')
    await settle(page, 1500)
    await user.click(sql)
    await page.keyboard.press('ControlOrMeta+a')
    await sql.pressSequentially(
      'SELECT service, COUNT(*) AS requests, AVG(duration_ms) AS avg_ms FROM "logs-*" GROUP BY service',
      {
        delay: 35
      }
    )
    await user.pause(500)
    await page.keyboard.press('ControlOrMeta+Enter')
    await page.getByTestId('search-sql-results').waitFor()
    await settle(page, 2500)

    await user.click(sql)
    await page.keyboard.press('ControlOrMeta+End')
    await sql.pressSequentially(' HAVING AVG(duration_ms) > 100 ORDER BY avg_ms DESC', { delay: 50 })
    await user.pause(500)
    await page.keyboard.press('ControlOrMeta+Enter')
    await settle(page, 3500)
  }
}

export const ERROR_LATENCY_SEARCH = {
  size: 0,
  query: { term: { level: 'error' } },
  aggs: { services: { terms: { field: 'service' }, aggs: { latency: { avg: { field: 'duration_ms' } } } } }
}

export const requestBody = async (page, body) => {
  await page.getByTestId('rest-request-body').locator('.cm-content').click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText(JSON.stringify(body, null, 2))
  await page.keyboard.press('ControlOrMeta+Home')
}

const REST_HISTORY = [
  ['GET', '_cluster/health'],
  ['GET', '_cat/nodes?v&h=name,heap.percent,cpu,load_1m'],
  ['GET', '_cat/shards?v&s=index'],
  ['GET', '_cat/indices?v&s=index'],
  ['POST', 'orders/_search', { query: { range: { total: { gte: 250 } } }, sort: [{ created_at: 'desc' }] }],
  ['POST', 'movies/_search', { query: { term: { genre: 'Sci-Fi' } }, sort: [{ rating: 'desc' }] }],
  ['POST', 'movies/_search', { size: 5, query: { match: { title: 'silent harbor' } }, sort: [{ rating: 'desc' }] }],
  ['POST', 'logs-*/_search?filter_path=aggregations', ERROR_LATENCY_SEARCH]
]

const rest = {
  prepare: async (page) => {
    await open(page, 'rest')
    const path = page.getByTestId('rest-path')
    await path.waitFor()
    await settle(page)
    for (const [method, url, body] of REST_HISTORY) {
      await page.getByTestId('rest-method').click()
      await page.getByRole('option', { name: method, exact: true }).click()
      await path.fill(url)
      await page.keyboard.press('Escape')
      if (body) await requestBody(page, body)
      const response = elasticsearchResponse(page)
      await page.getByRole('button', { name: t('query.rest.form.send_request') }).click()
      await response
    }
    await page.getByTestId('rest-tab-add').click()
    await page.getByTestId('rest-tab-close').first().click()
    await page.getByTestId('rest-tab').nth(1).waitFor({ state: 'detached' })
    await settle(page)
  },
  act: async (page, user) => {
    const path = page.getByTestId('rest-path')
    const send = page.getByRole('button', { name: t('query.rest.form.send_request') })
    const suggestions = page.locator('.q-menu .q-item')
    const sendAndWait = async () => {
      const response = elasticsearchResponse(page)
      await user.click(send)
      await response
      await user.moveTo(1100, 950)
      await settle(page, 2500)
    }
    const searchHistory = async (typed, pick) => {
      await user.click(path)
      await page.keyboard.press('ControlOrMeta+a')
      await page.keyboard.press('Backspace')
      for (const part of typed) {
        await path.pressSequentially(part, { delay: 170 })
        await suggestions.first().waitFor()
        await user.pause(1100)
      }
      const suggestion = suggestions.filter({ hasText: pick }).first()
      await user.move(suggestions.first())
      await user.pause(600)
      await user.click(suggestion)
      await user.pause(1000)
      await sendAndWait()
    }
    await user.pause(1200)

    await searchHistory(['_cat'], '_cat/indices')
    await searchHistory(['movies', ' harbor'], 'silent harbor')
    await searchHistory(['logs', ' error'], 'filter_path=aggregations')

    await user.click(page.getByTestId('rest-library-open'))
    await user.pause(2000)
    await user.click(page.getByTestId('rest-library-close'))
    await user.pause(1000)
  }
}

export const VIDEOS = { search, rest, shards, tools, indices }
