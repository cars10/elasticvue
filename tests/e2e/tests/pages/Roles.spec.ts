import { test, expect, Page } from '../../fixtures'
import { setupClusterConnection } from '../../helpers'
import { withElastic } from '../../mocks'
import { mockElastic8 } from '../../mocks/elastic_8'
import { openSecurityPage } from '../../helpers/security'

test.describe.configure({ mode: 'parallel' })

type Write = { method: string; path: string; body: Record<string, unknown> | null }

const recordWrites = async (page: Page, url: string, json: object) => {
  const writes: Write[] = []
  await page.route(url, async (route) => {
    const request = route.request()
    writes.push({ method: request.method(), path: new URL(request.url()).pathname, body: request.postDataJSON() })
    await route.fulfill({ json })
  })
  return writes
}

const dialog = (page: Page) => page.locator('.q-dialog')

test.describe('Roles', () => {
  const versions = [
    { key: 5, version: '5.6.16', base: '_xpack/security', modern: false },
    { key: 8, version: '8.15.0', base: '_security', modern: true }
  ] as const

  withElastic(
    versions.map((v) => v.key),
    ({ mockElastic, elastic }) => {
      const { base, modern } = versions.find((v) => v.version === elastic.version)!

      test(`lists roles on ${elastic.version}`, async ({ page }) => {
        await mockElastic(page)
        await setupClusterConnection(page)
        await openSecurityPage(page, 'roles')

        const table = page.getByTestId('roles-table')
        await expect(table).toContainText('read_only')
        await expect(table).toContainText('monitor')
        if (modern) {
          await expect(table).toContainText('Read-only access')
          await expect(table.locator('tr', { hasText: 'deprecated_role' })).toContainText('deprecated')
        } else {
          await expect(table).not.toContainText('Read-only access')
          await expect(table).not.toContainText('deprecated')
        }
      })

      test(`creates a role on ${elastic.version}`, async ({ page }) => {
        await mockElastic(page)
        const writes = await recordWrites(page, `http://localhost:9200/${base}/role/new_role`, { role: { created: true } })
        await setupClusterConnection(page)
        await openSecurityPage(page, 'roles')

        await page.locator('#new_role').click()
        await dialog(page).locator('input[name="name"]').fill('new_role')
        if (modern) await dialog(page).locator('input[name="description"]').fill('A new role')
        else await expect(dialog(page).locator('input[name="description"]')).toHaveCount(0)
        await page.locator('#create_role').click()
        await expect(dialog(page)).toHaveCount(0)

        expect(writes).toHaveLength(1)
        expect(writes[0]).toMatchObject({ method: 'PUT', path: `/${base}/role/new_role` })
        expect(writes[0].body).toHaveProperty('indices')
        expect(writes[0].body).not.toHaveProperty('applications')
        if (modern) expect(writes[0].body?.description).toBe('A new role')
        else expect(writes[0].body).not.toHaveProperty('description')
      })

      test(`edits a role and strips unsupported fields on ${elastic.version}`, async ({ page }) => {
        await mockElastic(page)
        const writes = await recordWrites(page, `http://localhost:9200/${base}/role/viewer`, { role: { created: false } })
        await setupClusterConnection(page)
        await openSecurityPage(page, 'roles')

        await page
          .getByTestId('roles-table')
          .locator('tr')
          .filter({ has: page.getByText('viewer', { exact: true }) })
          .getByTestId('edit-role')
          .click()
        await expect(dialog(page).locator('input[name="name"]')).toHaveValue('viewer')
        await expect(dialog(page).locator('input[name="name"]')).toHaveAttribute('readonly', '')
        if (modern) await expect(dialog(page).locator('input[name="description"]')).toHaveValue('View movies index')

        await page.getByTestId('role-form-cluster').click()
        await page.getByRole('option', { name: 'manage', exact: true }).click()
        await page.keyboard.press('Escape')
        await page.locator('#update_role').click()
        await expect(dialog(page)).toHaveCount(0)

        expect(writes).toHaveLength(1)
        const body = writes[0].body!
        expect(body.cluster).toEqual(['manage'])
        expect(body.indices).toEqual([
          { names: ['movies'], privileges: ['read'], ...(modern ? { allow_restricted_indices: false } : {}) }
        ])
        expect(body).not.toHaveProperty('transient_metadata')
        expect(body).not.toHaveProperty('metadata')
        if (modern) {
          expect(body.applications).toEqual([])
          expect(body.description).toBe('View movies index')
        } else {
          expect(body).not.toHaveProperty('applications')
          expect(body).not.toHaveProperty('description')
        }
      })
    }
  )

  test('deletes a role', async ({ page }) => {
    await mockElastic8(page)
    const writes = await recordWrites(page, 'http://localhost:9200/_security/role/read_only', { found: true })
    await setupClusterConnection(page)
    await openSecurityPage(page, 'roles')

    page.once('dialog', (confirm) => confirm.accept())
    await page.getByTestId('roles-table').locator('tr', { hasText: 'read_only' }).getByTestId('delete-role').click()

    await expect(page.getByText("The role 'read_only' was successfully deleted.")).toBeVisible()
    expect(writes).toEqual([{ method: 'DELETE', path: '/_security/role/read_only', body: null }])
  })
})
