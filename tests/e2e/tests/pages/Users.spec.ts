import { test, expect } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { withElastic } from '../../mocks'
import { mockElastic8 } from '../../mocks/elastic_8'
import {
  securityApiBase,
  supportsNativeSecurityApi,
  supportsSecurityDeprecated,
  supportsUserEnabled,
  openSecurityPage
} from '../../helpers/security'

test.describe.configure({ mode: 'parallel' })

const waitForClusterReady = async (page: import('@playwright/test').Page) => {
  await page.waitForResponse((response) => response.url().includes('localhost:9200') && response.ok())
}

withElastic(({ mockElastic, elastic }) => {
  const version = elastic.version
  const isOpenSearch = elastic.node.startsWith('os-')

  if (isOpenSearch) {
    test.describe(`opensearch ${version}`, () => {
      test.describe('Users', () => {
        test('hides users navigation on OpenSearch', async ({ page }) => {
          await mockElastic(page)
          await setupClusterConnection(page)
          await waitForClusterReady(page)
          await expect(page.locator('#users')).toHaveCount(0)
        })
      })
    })
    return
  }

  const base = securityApiBase(version)

  test.describe(`elasticsearch ${version}`, () => {
    test.describe('Users', () => {
      if (!supportsNativeSecurityApi(version)) {
        test('hides users navigation', async ({ page }) => {
          await mockElastic(page)
          await setupClusterConnection(page)
          await waitForClusterReady(page)
          await expect(page.locator('#users')).toHaveCount(0)
        })
        return
      }

      test('shows version-appropriate users table', async ({ page }) => {
        await mockElastic(page)
        await setupClusterConnection(page)
        await openSecurityPage(page, 'users_list')

        const table = page.getByTestId('users-table')
        await expect(table).toContainText('app_user')
        await expect(table).toContainText('read_only')

        await expect(table.locator('tr', { hasText: 'disabled_user' })).toContainText('disabled')

        if (supportsSecurityDeprecated(version)) {
          await expect(table.locator('tr', { hasText: 'deprecated_user' })).toContainText('deprecated')
        } else {
          await expect(table).not.toContainText('deprecated')
        }
      })

      test('can create a user with version-safe body', async ({ page }) => {
        let putBody: Record<string, unknown> | undefined
        await mockElastic(page)
        await page.route(`http://localhost:9200/${base}/user/new_user`, async (route) => {
          if (route.request().method() === 'PUT') {
            putBody = route.request().postDataJSON()
            await route.fulfill({ json: { created: true } })
            return
          }
          await route.fallback()
        })
        await setupClusterConnection(page)
        await openSecurityPage(page, 'users_list')

        await page.locator('#new_user').click()
        await page.locator('.q-dialog input[name="username"]').fill('new_user')
        await page.locator('.q-dialog input[name="password"]').fill('secret-password')

        if (supportsUserEnabled(version)) {
          await expect(page.locator('.q-dialog').getByText('Enabled')).toBeVisible()
        } else {
          await expect(page.locator('.q-dialog').getByText('Enabled')).toHaveCount(0)
        }

        await page.getByTestId('user-form-roles').click()
        await page.getByRole('option', { name: 'read_only' }).click()
        await page.keyboard.press('Escape')

        await page.locator('#create_user').click()
        await expect(page.locator('.q-dialog')).toHaveCount(0)

        expect(putBody).toBeTruthy()
        expect(putBody?.roles).toEqual(['read_only'])
        if (supportsUserEnabled(version)) {
          expect(putBody).toHaveProperty('enabled')
        } else {
          expect(putBody).not.toHaveProperty('enabled')
        }
      })
    })
  })
})

test.describe('Users on 8.15.0', () => {
  test('can filter users', async ({ page }) => {
    await mockElastic8(page)
    await setupClusterConnection(page)
    await openSecurityPage(page, 'users_list')

    const table = page.getByTestId('users-table')

    await page.locator('input[name="filter"]').fill('app_user')
    await expect(table).toContainText('app_user')

    await page.locator('input[name="filter"]').fill('LOREM_IPSUM_INVALID_USER_NAME')
    await expect(table).not.toContainText('app_user')
  })

  test('can edit a user', async ({ page }) => {
    await mockElastic8(page)
    await page.route('http://localhost:9200/_security/user/app_user', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ json: { created: false } })
        return
      }
      await route.fallback()
    })
    await setupClusterConnection(page)
    await openSecurityPage(page, 'users_list')

    const table = page.getByTestId('users-table')
    await table.locator('tr', { hasText: 'app_user' }).getByTestId('edit-user').click()

    await expect(page.locator('.q-dialog input[name="username"]')).toHaveValue('app_user')
    await expect(page.locator('.q-dialog input[name="username"]')).toHaveAttribute('readonly', '')

    await page.getByTestId('user-form-roles').click()
    await page.getByRole('option', { name: 'viewer' }).click()
    await page.keyboard.press('Escape')

    await page.locator('#update_user').click()
    await expect(page.locator('.q-dialog')).toHaveCount(0)
  })

  test('can delete a user', async ({ page }) => {
    await mockElastic8(page)
    await page.route('http://localhost:9200/_security/user/app_user', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ json: { found: true } })
        return
      }
      await route.fallback()
    })
    await setupClusterConnection(page)
    await openSecurityPage(page, 'users_list')

    page.once('dialog', (dialog) => dialog.accept())

    const table = page.getByTestId('users-table')
    await table.locator('tr', { hasText: 'app_user' }).getByTestId('delete-user').click()

    await expect(page.getByText("The user 'app_user' was successfully deleted.")).toBeVisible()
  })

  test('can edit a reserved user password', async ({ page }) => {
    await mockElastic8(page)
    await page.route('http://localhost:9200/_security/user/elastic/_password', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ json: {} })
        return
      }
      await route.fallback()
    })
    await setupClusterConnection(page)
    await openSecurityPage(page, 'users_list')

    const table = page.getByTestId('users-table')
    await table.locator('tr', { hasText: 'elastic' }).getByTestId('edit-user').click()

    await expect(page.locator('.q-dialog input[name="username"]')).toBeDisabled()
    await expect(page.getByTestId('user-form-roles')).toBeDisabled()
    await page.locator('.q-dialog input[name="password"]').fill('new-secret')

    await page.locator('#update_user').click()
    await expect(page.locator('.q-dialog')).toHaveCount(0)
  })
})
