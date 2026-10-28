import { test, expect, Page } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { mockElastic8 } from '../../mocks/elastic_8'

test.describe.configure({ mode: 'parallel' })

const ES = 'http://localhost:9200'
const CLUSTER_UUID = 'ecdKaffmR9WkFbKDW4PUWw'

const mockRestEndpoints = async (page: Page) => {
  await page.route(`${ES}/rest_e2e/_count`, (route) => route.fulfill({ json: { count: 42 } }))
  await page.route(`${ES}/rest_e2e/_search`, (route) =>
    route.fulfill({ json: { took: 1, echo: route.request().postDataJSON() } })
  )
  await page.route(`${ES}/missing_index/_search`, (route) =>
    route.fulfill({ status: 404, json: { error: { type: 'index_not_found_exception' } } })
  )
}

const setup = async (page: Page) => {
  await mockElastic8(page)
  await mockRestEndpoints(page)
  await setupClusterConnection(page)
  await page.waitForResponse((response) => response.url().startsWith(ES) && response.ok())
}

const openRest = async (page: Page) => {
  await page.locator('#rest').click()
  await expect(pathInput(page)).toBeVisible()
}

const pathInput = (page: Page) => page.getByTestId('rest-path')
const method = (page: Page) => page.getByRole('combobox', { name: 'HTTP Method' })
const status = (page: Page) => page.getByTestId('rest-response-status')
const responseBody = (page: Page) => page.getByTestId('rest-response-body').locator('.cm-content')
const requestBody = (page: Page) => page.getByTestId('rest-request-body').locator('.cm-content')
const tabs = (page: Page) => page.getByTestId('rest-tab')
const libraryItems = (page: Page) => page.getByTestId('rest-library-item')

const selectMethod = async (page: Page, name: string) => {
  await page.getByTestId('rest-method').first().click()
  await page.getByRole('option', { name, exact: true }).click()
}

const typeBody = async (page: Page, body: string) => {
  await requestBody(page).click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText(body)
}

const send = async (page: Page, httpMethod: string, path: string, body?: string) => {
  await selectMethod(page, httpMethod)
  await pathInput(page).fill(path)
  if (body !== undefined) await typeBody(page, body)
  await pathInput(page).press('Enter')
  await expect(status(page)).toBeVisible()
}

const enterName = async (page: Page, name: string) => {
  const input = page.getByTestId('rest-name-input')
  await input.fill(name)
  await input.press('Enter')
}

const openLibrary = async (page: Page, tab: 'history' | 'saved' | 'examples') => {
  await page.getByTestId('rest-library-open').click()
  await page.getByTestId(`rest-library-${tab}`).click()
}

test.describe('REST', () => {
  test('sends a GET request and shows status, timing, size and body', async ({ page }) => {
    await setup(page)
    await openRest(page)
    await send(page, 'GET', 'rest_e2e/_count')

    await expect(status(page)).toContainText('200')
    await expect(page.getByTestId('rest-response-duration')).toContainText('ms')
    await expect(page.getByTestId('rest-response-size')).toContainText('B')
    await expect(responseBody(page)).toContainText('42')
  })

  test('sends a POST body with ctrl+enter', async ({ page }) => {
    await setup(page)
    await openRest(page)

    await selectMethod(page, 'POST')
    await pathInput(page).fill('rest_e2e/_search')
    await typeBody(page, '{"size": 3}')

    const request = page.waitForRequest(`${ES}/rest_e2e/_search`)
    await page.keyboard.press('Control+Enter')

    expect((await request).postDataJSON()).toEqual({ size: 3 })
    await expect(responseBody(page)).toContainText('echo')
  })

  test('hides the body editor for GET and switches to POST', async ({ page }) => {
    await setup(page)
    await openRest(page)

    await selectMethod(page, 'GET')
    await expect(page.getByTestId('rest-no-body-hint')).toBeVisible()

    await page.getByTestId('rest-no-body-hint').getByRole('button').click()
    await expect(method(page)).toHaveValue('POST')
    await expect(requestBody(page)).toBeVisible()
  })

  test('shows error responses and does not add them to history', async ({ page }) => {
    await setup(page)
    await openRest(page)
    await send(page, 'GET', 'missing_index/_search')

    await expect(status(page)).toContainText('404')
    await expect(responseBody(page)).toContainText('index_not_found_exception')

    await openLibrary(page, 'history')
    await expect(libraryItems(page)).toHaveCount(0)
  })

  test('records history, newest first, and loads entries into the current tab', async ({ page }) => {
    await setup(page)
    await openRest(page)
    await send(page, 'GET', 'rest_e2e/_count')
    await send(page, 'POST', 'rest_e2e/_search', '{"size": 1}')
    await send(page, 'POST', 'rest_e2e/_search', '{"size": 1}')

    await openLibrary(page, 'history')
    await expect(libraryItems(page)).toHaveCount(2)
    await expect(libraryItems(page).first()).toContainText('POST rest_e2e/_search')

    await libraryItems(page).nth(1).click()
    await expect(page.getByTestId('rest-library')).toBeHidden()
    await expect(method(page)).toHaveValue('GET')
    await expect(pathInput(page)).toHaveValue('rest_e2e/_count')
    await expect(tabs(page)).toHaveCount(1)
  })

  test('opens history in a new tab, deletes entries and clears history', async ({ page }) => {
    await setup(page)
    await openRest(page)
    await send(page, 'GET', 'rest_e2e/_count')
    await send(page, 'POST', 'rest_e2e/_search', '{}')

    await openLibrary(page, 'history')
    await libraryItems(page).first().getByTestId('rest-library-new-tab').click()
    await expect(tabs(page)).toHaveCount(2)
    await expect(pathInput(page)).toHaveValue('rest_e2e/_search')

    await openLibrary(page, 'history')
    await libraryItems(page).first().getByTestId('rest-library-delete').click()
    await expect(libraryItems(page)).toHaveCount(1)

    page.once('dialog', (dialog) => dialog.accept())
    await page.getByTestId('rest-library-clear').click()
    await expect(libraryItems(page)).toHaveCount(0)
  })

  test('saves, renames and deletes queries', async ({ page }) => {
    await setup(page)
    await openRest(page)
    await send(page, 'GET', 'rest_e2e/_count')

    await page.getByTestId('rest-save').click()
    await expect(page.getByTestId('rest-name-input')).toHaveValue('GET rest_e2e/_count')
    await enterName(page, 'Count docs')
    await expect(page.getByTestId('rest-name-input')).toBeHidden()
    await expect(page.getByTestId('rest-save')).toHaveText('bookmark')

    await openLibrary(page, 'saved')
    await expect(libraryItems(page)).toHaveCount(1)
    await expect(libraryItems(page)).toContainText('Count docs')

    await libraryItems(page).getByTestId('rest-library-rename').click()
    await enterName(page, 'Renamed')
    await expect(libraryItems(page)).toContainText('Renamed')

    await libraryItems(page).getByTestId('rest-library-delete').click()
    await expect(libraryItems(page)).toHaveCount(0)
  })

  test('saves history entries as queries', async ({ page }) => {
    await setup(page)
    await openRest(page)
    await send(page, 'GET', 'rest_e2e/_count')

    await openLibrary(page, 'history')
    await libraryItems(page).getByTestId('rest-library-save').click()
    await enterName(page, 'From history')

    await page.getByTestId('rest-library-saved').click()
    await expect(libraryItems(page)).toContainText('From history')
  })

  test('filters and loads examples', async ({ page }) => {
    await setup(page)
    await openRest(page)

    await openLibrary(page, 'examples')
    await page.getByTestId('rest-library').locator('input[name="filter"]').fill('_cat/aliases')
    await expect(libraryItems(page)).toHaveCount(1)

    await libraryItems(page).click()
    await expect(method(page)).toHaveValue('GET')
    await expect(pathInput(page)).toHaveValue('_cat/aliases')
  })

  test('autocompletes from history and saved queries by method, path and body', async ({ page }) => {
    await setup(page)
    await openRest(page)
    await send(page, 'POST', 'rest_e2e/_search', '{"size": 7}')
    await send(page, 'GET', 'rest_e2e/_count')

    await page.getByTestId('rest-tab-add').click()
    await pathInput(page).pressSequentially('"size"')
    const suggestions = page.locator('.q-menu .q-item')
    await expect(suggestions).toHaveCount(1)
    await expect(suggestions).toContainText('POST rest_e2e/_search')

    await pathInput(page).press('ArrowDown')
    await pathInput(page).press('Enter')
    await expect(method(page)).toHaveValue('POST')
    await expect(pathInput(page)).toHaveValue('rest_e2e/_search')
    await expect(requestBody(page)).toContainText('"size": 7')

    await pathInput(page).fill('rest_e2e/_count')
    await selectMethod(page, 'GET')
    await pathInput(page).press('Enter')
    await expect(responseBody(page)).toContainText('42')
  })

  test('adds, renames and closes tabs and keeps them across reloads', async ({ page }) => {
    await setup(page)
    await openRest(page)
    await send(page, 'POST', 'rest_e2e/_search', '{"size": 2}')

    await page.getByTestId('rest-tab-add').click()
    await expect(tabs(page)).toHaveCount(2)
    await page.getByTestId('rest-tab-rename').click()
    await enterName(page, 'Second')
    await expect(tabs(page).nth(1)).toContainText('Second')
    await send(page, 'GET', 'rest_e2e/_count')
    await page.waitForTimeout(500)

    await page.reload()
    await openRest(page)
    await expect(tabs(page)).toHaveCount(2)
    await expect(tabs(page).nth(1)).toContainText('Second')

    await tabs(page).first().click()
    await expect(pathInput(page)).toHaveValue('rest_e2e/_search')
    await expect(requestBody(page)).toContainText('"size": 2')
    await expect(responseBody(page)).toContainText('echo')

    await tabs(page).nth(1).click()
    await expect(pathInput(page)).toHaveValue('rest_e2e/_count')
    await expect(responseBody(page)).toContainText('42')

    await tabs(page).nth(1).getByTestId('rest-tab-close').click()
    await expect(tabs(page)).toHaveCount(1)
    await expect(page.getByTestId('rest-tab-close')).toHaveCount(0)
  })

  test('downloads the response body', async ({ page }) => {
    await setup(page)
    await openRest(page)
    await send(page, 'GET', 'rest_e2e/_count')

    const download = page.waitForEvent('download')
    await page.getByTestId('rest-download').getByRole('button').click()
    expect((await download).suggestedFilename()).toBe('get_rest_e2e_count.json')
  })

  test('pastes kibana console requests', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are chromium only')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await setup(page)
    await openRest(page)
    await page.evaluate(() => navigator.clipboard.writeText('POST rest_e2e/_search\n{"size": 5}'))
    await page.getByTestId('rest-paste').click()

    await expect(method(page)).toHaveValue('POST')
    await expect(pathInput(page)).toHaveValue('rest_e2e/_search')
    await expect(requestBody(page)).toContainText('"size": 5')
  })

  test('migrates data stored by older versions', async ({ page }) => {
    await setup(page)

    await page.evaluate(
      (name) =>
        new Promise((resolve, reject) => {
          const open = indexedDB.open(name, 1)
          open.onupgradeneeded = () => {
            for (const table of ['restQueryHistory', 'restQuerySavedQueries', 'restQueryTabs']) {
              const store = open.result.createObjectStore(table, { keyPath: 'id', autoIncrement: true })
              if (table === 'restQueryHistory') store.createIndex('date', 'date')
            }
          }
          open.onsuccess = () => {
            const tx = open.result.transaction(['restQueryTabs', 'restQuerySavedQueries'], 'readwrite')
            tx.objectStore('restQueryTabs').add({
              name: 'tab-1',
              label: 'Legacy tab',
              request: { method: 'GET', path: 'legacy/_count', body: '' },
              response: { status: '200 OK', ok: true, bodyText: '{"legacy": true}' }
            })
            tx.objectStore('restQuerySavedQueries').add({ method: 'GET', path: 'legacy/_search', body: '' })
            tx.oncomplete = () => {
              open.result.close()
              resolve(null)
            }
            tx.onerror = () => reject(tx.error)
          }
          open.onerror = () => reject(open.error)
        }),
      `elasticvue-${CLUSTER_UUID}`
    )

    await openRest(page)
    await expect(tabs(page)).toContainText('Legacy tab')
    await expect(pathInput(page)).toHaveValue('legacy/_count')
    await expect(responseBody(page)).toContainText('legacy')

    await openLibrary(page, 'saved')
    await expect(libraryItems(page)).toContainText('GET legacy/_search')

    const stored = () =>
      page.evaluate(
        (name) =>
          new Promise<{ version: number; tab: unknown; response: unknown }>((resolve) => {
            const open = indexedDB.open(name)
            open.onsuccess = () => {
              const db = open.result
              const tx = db.transaction(['restQueryTabs', 'restQueryResponses'])
              const tab = tx.objectStore('restQueryTabs').get(1)
              const response = tx.objectStore('restQueryResponses').get(1)
              tx.oncomplete = () => {
                resolve({ version: db.version, tab: tab.result, response: response.result })
                db.close()
              }
            }
          }),
        `elasticvue-${CLUSTER_UUID}`
      )

    await expect.poll(async () => (await stored()).version).toBe(2)
    await expect.poll(async () => (await stored()).tab).not.toHaveProperty('response')
    await expect.poll(async () => (await stored()).response).toMatchObject({ id: 1, bodyText: '{"legacy": true}' })
  })
})
