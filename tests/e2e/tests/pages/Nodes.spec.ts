import { test, expect } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { withElastic } from '../../mocks'
import { mockElastic8 } from '../../mocks/elastic_8'

test.describe.configure({ mode: 'parallel' })

test.describe('Nodes', () => {
  withElastic(({ mockElastic, elastic }) => {
    test(`shows a list of nodes with attributes on ${elastic.version}`, async ({ page }) => {
      await mockElastic(page)
      await setupClusterConnection(page)
      await page.locator('#nodes').click()

      const table = page.getByTestId('nodes-table')
      await expect(table).toContainText(elastic.node)
      await expect(table).toContainText('datacenter')
      await expect(table).not.toContainText('xpack.')
    })
  })

  test('shows the error when nodes cannot be loaded', async ({ page }) => {
    await mockElastic8(page)
    await page.route('**/_cat/nodes**', (route) =>
      route.fulfill({ status: 403, json: { error: { type: 'security_exception', reason: 'missing monitor privilege' } } })
    )
    await setupClusterConnection(page)
    await page.locator('#nodes').click()

    await expect(page.getByText('missing monitor privilege')).toBeVisible()
  })

  test('filters nodes by role inside the table', async ({ page }) => {
    await mockElastic8(page)
    await setupClusterConnection(page)
    await page.locator('#nodes').click()

    const table = page.getByTestId('nodes-table')
    await expect(table).toContainText('es-8-node-1')
    await page.getByLabel('Node role').click()
    await page.getByRole('option', { name: 'Voting-only node' }).click()
    await expect(table).not.toContainText('es-8-node-1')
  })

  test('can filter nodes', async ({ page }) => {
    await mockElastic8(page)
    await setupClusterConnection(page)
    await page.locator('#nodes').click()

    const table = page.getByTestId('nodes-table')

    await page.locator('input[name="filter"]').fill('es-8-node-1')
    await expect(table).toContainText('es-8-node-1')

    await page.locator('input[name="filter"]').fill('LOREM_IPSUM_INVALID_NODE_NAME')
    await expect(table).not.toContainText('es-8-node-1')
  })
})
