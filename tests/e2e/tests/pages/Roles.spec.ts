import { test, expect } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { withElastic } from '../../mocks'
import { mockElastic8 } from '../../mocks/elastic_8'
import {
  securityApiBase,
  supportsAllowRestrictedIndices,
  supportsNativeSecurityApi,
  supportsRoleApplications,
  supportsRoleDescription,
  supportsSecurityDeprecated,
  openSecurityPage
} from '../../helpers/security'

test.describe.configure({ mode: 'parallel' })

withElastic(({ mockElastic, elastic }) => {
  const version = elastic.version
  const isOpenSearch = elastic.node.startsWith('os-')

  if (isOpenSearch) {
    test.describe(`opensearch ${version}`, () => {
      test.describe('Roles', () => {
        test('hides roles access on OpenSearch', async ({ page }) => {
          await mockElastic(page)
          await setupClusterConnection(page)
          await page.waitForResponse((response) => response.url().includes('localhost:9200') && response.ok())
          await expect(page.locator('#users')).toHaveCount(0)
        })
      })
    })
    return
  }

  const base = securityApiBase(version)

  test.describe(`elasticsearch ${version}`, () => {
    test.describe('Roles', () => {
      if (!supportsNativeSecurityApi(version)) {
        test('hides roles access when users navigation is unavailable', async ({ page }) => {
          await mockElastic(page)
          await setupClusterConnection(page)
          await page.waitForResponse((response) => response.url().includes('localhost:9200') && response.ok())
          await expect(page.locator('#users')).toHaveCount(0)
        })
        return
      }

      test('shows version-appropriate roles table', async ({ page }) => {
        await mockElastic(page)
        await setupClusterConnection(page)
        await openSecurityPage(page, 'roles')

        const table = page.getByTestId('roles-table')
        await expect(table).toContainText('read_only')
        await expect(table).toContainText('monitor')

        if (supportsRoleDescription(version)) {
          await expect(table).toContainText('Read-only access')
        } else {
          await expect(table).not.toContainText('Read-only access')
        }

        if (supportsSecurityDeprecated(version)) {
          await expect(table.locator('tr', { hasText: 'deprecated_role' })).toContainText('deprecated')
        } else {
          await expect(table).not.toContainText('deprecated')
        }
      })

      test('can create a role with version-safe body', async ({ page }) => {
        let putBody: Record<string, unknown> | undefined
        await mockElastic(page)
        await page.route(`http://localhost:9200/${base}/role/new_role`, async (route) => {
          if (route.request().method() === 'PUT') {
            putBody = route.request().postDataJSON()
            await route.fulfill({ json: { role: { created: true } } })
            return
          }
          await route.fallback()
        })
        await setupClusterConnection(page)
        await openSecurityPage(page, 'roles')

        await page.locator('#new_role').click()
        await page.locator('.q-dialog input[name="name"]').fill('new_role')

        if (supportsRoleDescription(version)) {
          await expect(page.locator('.q-dialog input[name="description"]')).toBeVisible()
          await page.locator('.q-dialog input[name="description"]').fill('A new role')
        } else {
          await expect(page.locator('.q-dialog input[name="description"]')).toHaveCount(0)
        }

        await page.locator('#create_role').click()
        await expect(page.locator('.q-dialog')).toHaveCount(0)

        expect(putBody).toBeTruthy()
        expect(putBody).toHaveProperty('indices')
        expect(putBody).not.toHaveProperty('applications')
        if (supportsRoleDescription(version)) {
          expect(putBody?.description).toBe('A new role')
        } else {
          expect(putBody).not.toHaveProperty('description')
        }
      })

      test('can edit a role and strip unsupported fields', async ({ page }) => {
        let putBody: Record<string, unknown> | undefined
        await mockElastic(page)
        await page.route(`http://localhost:9200/${base}/role/read_only`, async (route) => {
          if (route.request().method() === 'PUT') {
            putBody = route.request().postDataJSON()
            await route.fulfill({ json: { role: { created: false } } })
            return
          }
          await route.fallback()
        })
        await setupClusterConnection(page)
        await openSecurityPage(page, 'roles')

        const table = page.getByTestId('roles-table')
        await table.locator('tr', { hasText: 'read_only' }).getByTestId('edit-role').click()

        await expect(page.locator('.q-dialog input[name="name"]')).toHaveValue('read_only')
        await expect(page.locator('.q-dialog input[name="name"]')).toHaveAttribute('readonly', '')

        if (supportsRoleDescription(version)) {
          await expect(page.locator('.q-dialog input[name="description"]')).toHaveValue('Read-only access')
        }

        await page.getByTestId('role-form-cluster').click()
        await page.getByRole('option', { name: 'manage', exact: true }).click()
        await page.keyboard.press('Escape')

        await page.locator('#update_role').click()
        await expect(page.locator('.q-dialog')).toHaveCount(0)

        expect(putBody).toBeTruthy()
        expect(putBody?.cluster).toEqual(expect.arrayContaining(['monitor', 'manage']))

        if (supportsRoleApplications(version)) {
          expect(putBody).toHaveProperty('applications')
        } else {
          expect(putBody).not.toHaveProperty('applications')
        }

        if (supportsRoleDescription(version)) {
          expect(putBody?.description).toBe('Read-only access')
        } else {
          expect(putBody).not.toHaveProperty('description')
        }

        const indices = putBody?.indices as Record<string, unknown>[] | undefined
        if (indices?.length && !supportsAllowRestrictedIndices(version)) {
          for (const entry of indices) {
            expect(entry).not.toHaveProperty('allow_restricted_indices')
          }
        }

        expect(putBody).not.toHaveProperty('transient_metadata')
        if (putBody?.metadata && typeof putBody.metadata === 'object') {
          for (const key of Object.keys(putBody.metadata as object)) {
            expect(key.startsWith('_')).toBe(false)
          }
        }
      })
    })
  })
})

test.describe('Roles on 8.15.0', () => {
  test('can filter roles', async ({ page }) => {
    await mockElastic8(page)
    await setupClusterConnection(page)
    await openSecurityPage(page, 'roles')

    const table = page.getByTestId('roles-table')

    await page.locator('input[name="filter"]').fill('read_only')
    await expect(table).toContainText('read_only')

    await page.locator('input[name="filter"]').fill('LOREM_IPSUM_INVALID_ROLE_NAME')
    await expect(table).not.toContainText('read_only')
  })

  test('can delete a role', async ({ page }) => {
    await mockElastic8(page)
    await page.route('http://localhost:9200/_security/role/read_only', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ json: { found: true } })
        return
      }
      await route.fallback()
    })
    await setupClusterConnection(page)
    await openSecurityPage(page, 'roles')

    page.once('dialog', (dialog) => dialog.accept())

    const table = page.getByTestId('roles-table')
    await table.locator('tr', { hasText: 'read_only' }).getByTestId('delete-role').click()

    await expect(page.getByText("The role 'read_only' was successfully deleted.")).toBeVisible()
  })
})
