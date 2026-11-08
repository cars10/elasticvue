import { expect, Page, test } from '@playwright/test'
import { setupClusterConnection } from '../../helpers.ts'
import { mockElastic1 } from '../../mocks/elastic_1/index.ts'
import { mockElastic2 } from '../../mocks/elastic_2/index.ts'
import { mockElastic8 } from '../../mocks/elastic_8/index.ts'

test.describe.configure({ mode: 'parallel' })

const trackCancel = async (page: Page) => {
  const cancelled: string[] = []
  await page.route(/localhost:9200\/_tasks\/.+\/_cancel/, async (route) => {
    cancelled.push(decodeURIComponent(new URL(route.request().url()).pathname))
    await route.fulfill({ json: { nodes: {} } })
  })
  return cancelled
}

test.describe('Tasks', () => {
  for (const [version, mockElastic] of [
    ['8.15.0', mockElastic8],
    ['2.4.6', mockElastic2]
  ] as const) {
    test(`lists and cancels running tasks on ${version}`, async ({ page }) => {
      await mockElastic(page)
      const cancelled = await trackCancel(page)
      await setupClusterConnection(page)
      await page.locator('#tasks').click()

      await expect(page.getByTestId('tasks-pulse-running')).toContainText('1')
      await expect(page.getByTestId('tasks-pulse-running')).toContainText('1 subtask')
      await expect(page.getByTestId('tasks-pulse-longest')).toContainText('2m 5s')
      await expect(page.getByTestId('tasks-pulse-background')).toContainText('50%')

      const table = page.getByTestId('tasks-table')
      const rows = table.getByTestId('task-row')
      await expect(rows).toHaveCount(1)
      await expect(rows.first()).toContainText('indices:data/write/reindex')
      await expect(rows.first()).toContainText('reindex from [logs] to [logs-new]')
      await expect(table).not.toContainText('cluster:monitor/tasks/lists')

      await rows.first().click()
      await expect(table).toContainText('indices:data/write/bulk')

      page.once('dialog', (dialog) => dialog.accept())
      await rows.first().getByTestId('cancel-task').click()
      await expect.poll(() => cancelled).toEqual(['/_tasks/node1:1/_cancel'])
    })
  }

  test('hides persistent and monitoring tasks until enabled in the filters', async ({ page }) => {
    await mockElastic8(page)
    await setupClusterConnection(page)
    await page.locator('#tasks').click()

    const table = page.getByTestId('tasks-table')
    await expect(table.getByTestId('task-row')).toHaveCount(1)
    await expect(page.getByTestId('tasks-hidden')).toContainText('2 tasks hidden by filters')
    await expect(page.getByTestId('tasks-pulse-longest')).toContainText('2m 5s')

    await page.getByTestId('tasks-types').click()
    for (const type of ['transport', 'direct', 'persistent', 'master', 'enrich']) {
      await expect(page.getByRole('option', { name: type })).toBeVisible()
    }
    await page.getByRole('option', { name: 'persistent' }).click()
    await page.keyboard.press('Escape')

    await expect(table.getByTestId('task-row')).toHaveCount(2)
    await expect(table).toContainText('xpack/ml/job[c]')
    await expect(page.getByTestId('tasks-pulse-longest')).toContainText('24h')

    await page.getByTestId('tasks-categories').click()
    await page.getByRole('option', { name: 'Monitoring' }).click()
    await page.keyboard.press('Escape')

    await expect(table.getByTestId('task-row')).toHaveCount(3)
    await expect(table).toContainText('cluster:monitor/nodes/stats')
    await expect(page.getByTestId('tasks-hidden')).toHaveCount(0)
  })

  test('is hidden in Elasticsearch 1.x', async ({ page }) => {
    await mockElastic1(page)
    await setupClusterConnection(page)

    await expect(page.locator('#nodes')).toBeVisible()
    await expect(page.locator('#tasks')).toHaveCount(0)

    await page.evaluate(() => {
      window.history.pushState({}, '', '/cluster/default-cluster/tasks')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await expect(page).toHaveURL(/\/cluster\/default-cluster$/)
  })
})
