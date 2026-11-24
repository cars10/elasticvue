import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'
import { setupContext, open, OUTPUT, settle, t, waitWithProgress } from './browser.mjs'
import { ERROR_LATENCY_SEARCH, elasticsearchResponse, indexRow, requestBody, warmup } from './videos.mjs'

const PAGES = {
  home: async (page) => {
    await open(page, '')
    await page.getByTestId('cluster-workload').waitFor()
    await waitWithProgress(page, warmup, `collecting dashboard graph data (${page.viewportSize().width}px)`)
  },
  clusters: async (page) => {
    await open(page, 'clusters')
    await page.getByTestId('cluster-card').nth(2).waitFor()
  },
  nodes: (page) => open(page, 'nodes'),
  shards: (page) => open(page, 'shards'),
  'shard-recovery': async (page) => {
    await open(page, 'shards/recovery')
    await page.getByTestId('shard-recovery-table').locator('tbody tr').first().waitFor()
  },
  tasks: async (page) => {
    await open(page, 'tasks')
    await page.getByTestId('task-row').first().waitFor()
  },
  'indices-plain': async (page) => {
    await open(page, 'indices')
    await indexRow(page, 'movies').waitFor()
  },
  indices: async (page) => {
    await PAGES['indices-plain'](page)
    await settle(page)
    await indexRow(page, 'movies').getByTestId('index-row-menu').click()
  },
  'index-aliases': async (page) => {
    await PAGES.indices(page)
    await page.locator('.q-menu').getByText(t('indices.index_aliases.text'), { exact: true }).click()
    await page.getByRole('dialog').waitFor()
  },
  search: async (page) => {
    await open(page, 'search')
    await page.getByTestId('search-result').first().waitFor()
  },
  'search-logs': async (page) => {
    await open(page, 'search')
    await page.evaluate((state) => localStorage.setItem('search-production', JSON.stringify(state)), {
      targets: ['logs-*'],
      q: '*',
      timeRange: { from: 'now-24h', to: 'now-15m' },
      pagination: { sortBy: '@timestamp', descending: true },
      histogramCollapsed: false,
      columnsByTarget: { 'logs-*': ['@timestamp', 'level', 'service', 'message', 'http.status', 'duration_ms'] }
    })
    await page.reload()
    await page.getByTestId('search-result').first().waitFor()
  },
  document: async (page) => {
    await PAGES.search(page)
    await page.getByTestId('search-result').first().locator('td').nth(3).click()
    await page.getByTestId('search-document-panel').waitFor()
  },
  rest: async (page) => {
    await open(page, 'rest')
    await page.getByTestId('rest-method').click()
    await page.getByRole('option', { name: 'POST', exact: true }).click()
    await page.getByTestId('rest-path').fill('logs-*/_search?filter_path=aggregations')
    await page.keyboard.press('Escape')
    await requestBody(page, ERROR_LATENCY_SEARCH)
    const response = elasticsearchResponse(page)
    await page.getByRole('button', { name: t('query.rest.form.send_request') }).click()
    await response
  },
  'index-templates': async (page) => {
    await open(page, 'index_templates')
    await page.getByTestId('index-templates-table').waitFor()
  },
  'snapshot-repositories': async (page) => {
    await open(page, 'snapshot_repositories', 'staging')
    await page.getByTestId('repository-policies').first().waitFor()
  },
  snapshots: async (page) => {
    await open(page, 'snapshot_repositories/backups', 'staging')
    await page.getByTestId('snapshots-pulse').waitFor()
  },
  users: async (page) => {
    await open(page, 'users', 'logging')
    await page.getByTestId('users-table').waitFor()
  },
  roles: async (page) => {
    await open(page, 'roles', 'logging')
    await page.getByTestId('roles-table').waitFor()
  },
  tools: (page) => open(page, 'tools'),
  settings: (page) => open(page, 'settings')
}

const WEBSITE_PAGES = [
  'home',
  'clusters',
  'nodes',
  'shards',
  'shard-recovery',
  'indices',
  'index-aliases',
  'index-templates',
  'search',
  'document',
  'rest',
  'tasks',
  'tools',
  'snapshot-repositories',
  'snapshots',
  'users',
  'roles',
  'settings'
]
const website = (theme) => ({
  dir: 'website',
  viewport: { width: 1920, height: 1080 },
  shots: WEBSITE_PAGES.map((name, i) => ({ name, theme, file: `website_${i + 1}_${name}_${theme}.png` }))
})

export const SCREENSHOTS = {
  website: [website('light'), website('dark')],
  extension: [
    {
      dir: 'extension',
      viewport: { width: 1280, height: 800 },
      shots: [
        ['home', 'light'],
        ['search-logs', 'dark'],
        ['tasks', 'dark'],
        ['indices-plain', 'dark'],
        ['rest', 'dark']
      ].map(([name, theme], i) => ({ name, theme, file: `ext-${i + 1}-${name}.png` }))
    }
  ]
}

const takeSet = async (browser, { dir, viewport, shots }) => {
  mkdirSync(`${OUTPUT}/${dir}`, { recursive: true })
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  await setupContext(context)
  const page = await context.newPage()
  for (const { name, theme, file } of shots) {
    await page.emulateMedia({ colorScheme: theme })
    await PAGES[name](page)
    await page.mouse.move(viewport.width - 1, viewport.height - 1)
    await settle(page)
    await page.locator('#version').evaluate((element) => element.remove()).catch(() => {})
    await page.screenshot({ path: `${OUTPUT}/${dir}/${file}` })
    console.log(`  ${dir}/${file}`)
  }
  await context.close()
}

export const takeScreenshots = async (sets) => {
  const browser = await chromium.launch()
  try {
    await Promise.all(sets.map((set) => takeSet(browser, set)))
  } finally {
    await browser.close()
  }
}
