import { exact, open, settle, t, waitWithProgress } from './browser.mjs'
import { ensureTasks } from './tasks.mjs'
import { CLUSTERS, es, waitForGreen } from './elasticsearch.mjs'

export const indexRow = (page, name) => page.getByTestId('indices-table').getByRole('row').filter({ has: exact(page, name) })
export const elasticsearchResponse = (page) => page.waitForResponse((response) => response.url().startsWith('http://es-'))
export const warmup = Number(process.env.DASHBOARD_WARMUP || 60)

const dashboard = {
  prepare: async (page) => {
    await open(page, '')
    await page.getByTestId('cluster-workload').waitFor()
    await waitWithProgress(page, warmup, 'collecting dashboard graph data')
  },
  act: async (page, user) => {
    await user.pause(1500)
    await user.hover([page.getByTestId('cluster-status'), page.getByTestId('cluster-capacity')], 1200)
    const charts = page.getByTestId('cluster-workload').locator('canvas, svg')
    for (let i = 0; i < Math.min(await charts.count(), 3); i++) await user.hover([charts.nth(i)], 1200)
    await user.hover([page.getByTestId('cluster-tasks')], 1500)

    const attention = page.getByTestId('cluster-attention')
    const toggle = attention.getByRole('button').first()
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') await user.click(toggle)
    await user.pause(1200)
    await user.scroll(350)
    await user.hover([attention.locator('.q-card__section').nth(1)], 2500)
    await user.scroll(500)
    await user.hover([page.getByTestId('cluster-node-load'), page.getByTestId('cluster-indices')], 1500)
    await user.scroll(-850)
    await user.pause(2000)
  }
}

const clusters = {
  prepare: async (page) => {
    await open(page, 'clusters')
    await page.getByTestId('cluster-card').nth(2).waitFor()
    await settle(page, 1500)
  },
  act: async (page, user) => {
    const cards = page.getByTestId('cluster-card')
    await user.pause(1500)
    for (let i = 0; i < 3; i++) await user.hover([cards.nth(i)], 1300)
    await user.click(cards.filter({ hasText: 'logging' }))
    await page.getByTestId('cluster-workload').waitFor()
    await settle(page, 2500)
    await user.hover([page.getByTestId('cluster-capacity')], 1500)
    await user.click(page.getByTestId('cluster-selection'))
    const table = page.getByTestId('cluster-table')
    await table.waitFor()
    await user.pause(1500)
    await user.click(table.locator('tr.clickable').filter({ hasText: 'production' }))
    await page.getByTestId('cluster-workload').waitFor()
    await settle(page, 3000)
  }
}

const taskRow = (page, action) => page.getByTestId('task-row').filter({ hasText: action })

const tasks = {
  prepare: async (page) => {
    await ensureTasks()
    await open(page, 'tasks')
    await taskRow(page, 'indices:data/write/reindex').waitFor()
    await settle(page)
  },
  act: async (page, user) => {
    await user.pause(1500)
    for (const id of ['running', 'longest', 'background', 'searches']) await user.hover([page.getByTestId(`tasks-pulse-${id}`)], 1000)

    await user.click(page.getByTestId('tasks-categories'))
    await user.pause(600)
    for (const category of ['search', 'write']) {
      await user.click(page.getByRole('option', { name: t(`tasks.categories.${category}`), exact: true }))
      await user.pause(400)
    }
    await page.keyboard.press('Escape')
    await settle(page, 1200)

    const reindex = taskRow(page, 'indices:data/write/reindex')
    await user.hover([reindex.locator('.progress-cell'), taskRow(page, 'update/byquery').locator('.progress-cell')], 1500)
    await user.click(reindex.locator('td').nth(1))
    await user.pause(3000)
    await user.click(reindex.locator('td').nth(1))
    await user.pause(800)

    const deleteByQuery = taskRow(page, 'delete/byquery')
    await user.hover([deleteByQuery], 1000)
    await user.click(deleteByQuery.getByTestId('cancel-task'))
    await deleteByQuery
      .getByText(t('tasks.task.cancelled'), { exact: true })
      .waitFor({ timeout: 5000 })
      .catch(() => {})
    await user.pause(3000)
  }
}

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
    await query.pressSequentially('lev', { delay: 120 })
    await page.getByTestId('search-query-suggestion').filter({ hasText: 'level' }).first().waitFor()
    await user.pause(900)
    await user.click(page.getByTestId('search-query-suggestion').filter({ hasText: 'level' }).first())
    await query.pressSequentially('err', { delay: 120 })
    await page.getByTestId('search-query-suggestion').filter({ hasText: 'error' }).first().waitFor()
    await user.pause(900)
    await user.click(page.getByTestId('search-query-suggestion').filter({ hasText: 'error' }).first())
    await query.press('Enter')
    await settle(page, 2000)

    await user.click(page.getByTestId('search-result').first().locator('td').nth(3))
    const panel = page.getByTestId('search-document-panel')
    await panel.waitFor()
    await user.pause(1500)
    const service = panel.getByTestId('search-panel-field').filter({ has: exact(page, 'service') })
    await user.move(service)
    await user.click(service.getByTestId('search-panel-filter-for'))
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

const MOVIE_SEARCH = {
  size: 5,
  query: { match: { title: 'silent harbor' } },
  sort: [{ rating: 'desc' }]
}

export const requestBody = async (page, body) => {
  await page.getByTestId('rest-request-body').locator('.cm-content').click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText(JSON.stringify(body, null, 2))
  await page.keyboard.press('ControlOrMeta+Home')
}

const rest = {
  prepare: async (page) => {
    await open(page, 'rest')
    await page.getByTestId('rest-path').waitFor()
    await settle(page)
  },
  act: async (page, user) => {
    const path = page.getByTestId('rest-path')
    const send = page.getByRole('button', { name: t('query.rest.form.send_request') })
    const sendAndWait = async () => {
      const response = elasticsearchResponse(page)
      await user.click(send)
      await response
      await user.moveTo(1100, 950)
      await settle(page, 2500)
    }
    await user.pause(1500)

    await user.click(page.getByTestId('rest-method'))
    await user.click(page.getByRole('option', { name: 'POST', exact: true }))
    await user.type(path, 'movies/_search')
    await page.keyboard.press('Escape')
    await user.move(page.getByTestId('rest-request-body'))
    await requestBody(page, MOVIE_SEARCH)
    await user.pause(1200)
    await sendAndWait()

    await user.click(path)
    await page.keyboard.press('ControlOrMeta+a')
    await path.pressSequentially('logs-*/_search?filter_path=aggregations', { delay: 50 })
    await page.keyboard.press('Escape')
    await user.move(page.getByTestId('rest-request-body'))
    await requestBody(page, ERROR_LATENCY_SEARCH)
    await user.pause(1200)
    await sendAndWait()

    await user.click(page.getByTestId('rest-library-open'))
    await user.pause(1500)
    await user.click(page.getByTestId('rest-library-examples'))
    await user.pause(1500)
    await user.click(page.getByTestId('rest-library-close'))

    await user.click(page.getByTestId('rest-tab-add'))
    await settle(page)
    await user.move(path)
    await path.pressSequentially('movies', { delay: 120 })
    const suggestion = page.locator('.q-menu .q-item').filter({ hasText: 'movies/_search' }).first()
    await suggestion.waitFor()
    await user.pause(1000)
    await user.click(suggestion)
    await user.pause(800)
    await sendAndWait()
  }
}

export const VIDEOS = { dashboard, clusters, tasks, shards, search, rest, indices, tools }
