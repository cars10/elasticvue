import { test, expect, Page } from '../../fixtures'
import { setupClusterConnection } from '../../helpers'
import { withElastic } from '../../mocks'
import { mockElastic8 } from '../../mocks/elastic_8'
import { openSecurityPage } from '../../helpers/security'

test.describe.configure({ mode: 'parallel' })

type Write = { method: string; path: string; body: unknown }

const recordWrites = async (page: Page, url: string, json: object = {}) => {
  const writes: Write[] = []
  await page.route(url, async (route) => {
    const request = route.request()
    writes.push({ method: request.method(), path: new URL(request.url()).pathname, body: request.postDataJSON() })
    await route.fulfill({ json })
  })
  return writes
}

const dialog = (page: Page) => page.locator('.q-dialog')

test.describe('Security navigation', () => {
  withElastic([2, 'opensearch-3'], ({ mockElastic, elastic }) => {
    test(`is hidden on ${elastic.version}`, async ({ page }) => {
      await mockElastic(page)
      await setupClusterConnection(page)

      await expect(page.locator('#indices')).toBeVisible()
      await expect(page.locator('#users')).toHaveCount(0)
    })
  })
})

test.describe('Users', () => {
  const versions = [
    { key: 5, version: '5.6.16', base: '_xpack/security', enabled: false, deprecated: false },
    { key: 8, version: '8.15.0', base: '_security', enabled: true, deprecated: true }
  ] as const

  withElastic(
    versions.map((v) => v.key),
    ({ mockElastic, elastic }) => {
      const { base, enabled, deprecated } = versions.find((v) => v.version === elastic.version)!

      test(`lists users on ${elastic.version}`, async ({ page }) => {
        await mockElastic(page)
        await setupClusterConnection(page)
        await openSecurityPage(page, 'users')

        const table = page.getByTestId('users-table')
        await expect(table).toContainText('app_user')
        await expect(table).toContainText('read_only')
        await expect(table.locator('tr', { hasText: 'disabled_user' })).toContainText('disabled')
        if (deprecated) await expect(table.locator('tr', { hasText: 'deprecated_user' })).toContainText('deprecated')
        else await expect(table).not.toContainText('deprecated')
      })

      test(`creates a user on ${elastic.version}`, async ({ page }) => {
        await mockElastic(page)
        const writes = await recordWrites(page, `http://localhost:9200/${base}/user/new_user`, { created: true })
        await setupClusterConnection(page)
        await openSecurityPage(page, 'users')

        await page.locator('#new_user').click()
        await dialog(page).locator('input[name="username"]').fill('new_user')
        await dialog(page).locator('input[name="password"]').fill('secret-password')
        await expect(dialog(page).getByText('Enabled')).toHaveCount(enabled ? 1 : 0)

        await page.getByTestId('user-form-roles').click()
        await page.getByRole('option', { name: 'read_only' }).click()
        await page.keyboard.press('Escape')
        await page.locator('#create_user').click()
        await expect(dialog(page)).toHaveCount(0)

        expect(writes).toEqual([
          {
            method: 'PUT',
            path: `/${base}/user/new_user`,
            body: {
              roles: ['read_only'],
              full_name: '',
              email: '',
              password: 'secret-password',
              ...(enabled ? { enabled: true } : {})
            }
          }
        ])
      })
    }
  )

  test('edits a user', async ({ page }) => {
    await mockElastic8(page)
    const writes = await recordWrites(page, 'http://localhost:9200/_security/user/app_user', { created: false })
    await setupClusterConnection(page)
    await openSecurityPage(page, 'users')

    await page.getByTestId('users-table').locator('tr', { hasText: 'app_user' }).getByTestId('edit-user').click()
    await expect(dialog(page).locator('input[name="username"]')).toHaveValue('app_user')
    await expect(dialog(page).locator('input[name="username"]')).toHaveAttribute('readonly', '')

    await page.getByTestId('user-form-roles').click()
    await page.getByRole('option', { name: 'viewer' }).click()
    await page.keyboard.press('Escape')
    await page.locator('#update_user').click()
    await expect(dialog(page)).toHaveCount(0)

    expect(writes).toEqual([
      {
        method: 'PUT',
        path: '/_security/user/app_user',
        body: {
          roles: ['read_only', 'watcher_admin', 'viewer'],
          full_name: 'App User',
          email: 'app@example.com',
          enabled: true
        }
      }
    ])
  })

  test('changes the password of a reserved user', async ({ page }) => {
    await mockElastic8(page)
    const writes = await recordWrites(page, 'http://localhost:9200/_security/user/elastic/_password')
    await setupClusterConnection(page)
    await openSecurityPage(page, 'users')

    await page.getByTestId('users-table').locator('tr', { hasText: 'elastic' }).getByTestId('edit-user').click()
    await expect(dialog(page).locator('input[name="username"]')).toBeDisabled()
    await expect(page.getByTestId('user-form-roles')).toBeDisabled()
    await dialog(page).locator('input[name="password"]').fill('new-secret')
    await page.locator('#update_user').click()
    await expect(dialog(page)).toHaveCount(0)

    expect(writes).toEqual([{ method: 'PUT', path: '/_security/user/elastic/_password', body: { password: 'new-secret' } }])
  })

  test('deletes a user', async ({ page }) => {
    await mockElastic8(page)
    const writes = await recordWrites(page, 'http://localhost:9200/_security/user/app_user', { found: true })
    await setupClusterConnection(page)
    await openSecurityPage(page, 'users')

    page.once('dialog', (confirm) => confirm.accept())
    await page.getByTestId('users-table').locator('tr', { hasText: 'app_user' }).getByTestId('delete-user').click()

    await expect(page.getByText("The user 'app_user' was successfully deleted.")).toBeVisible()
    expect(writes).toEqual([{ method: 'DELETE', path: '/_security/user/app_user', body: null }])
  })
})
