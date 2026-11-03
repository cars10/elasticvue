import { test, expect, Page } from '@playwright/test'
import { mockElastic8 } from '../../mocks/elastic_8'

test.describe.configure({ mode: 'parallel' })

const ES = 'http://localhost:9200'
const APP = 'http://localhost:5175'

type SeenRequest = { url: string; headers: Record<string, string> }

const mockSecuredElastic = async (page: Page, valid: (headers: Record<string, string>) => boolean) => {
  await page.route(`${ES}/**`, (route) => route.fulfill({ json: {} }))
  await mockElastic8(page)

  const seen: SeenRequest[] = []
  await page.route(`${ES}/**`, async (route) => {
    const headers = route.request().headers()
    seen.push({ url: route.request().url(), headers })
    if (!valid(headers)) return route.fulfill({ status: 401, json: { error: { type: 'security_exception' }, status: 401 } })
    return route.fallback()
  })
  return seen
}

const seedCluster = async (page: Page, auth: object) => {
  await page.addInitScript((auth) => {
    if (sessionStorage.getItem('seeded')) return
    sessionStorage.setItem('seeded', '1')
    localStorage.clear()
    localStorage.setItem(
      'connection',
      JSON.stringify({
        activeClusterId: 'secure',
        clusters: [
          {
            id: 'secure',
            name: 'secure cluster',
            uri: 'http://localhost:9200',
            status: 'green',
            clusterName: '',
            version: '',
            majorVersion: '',
            distribution: 'elasticsearch',
            flavor: 'default',
            auth
          }
        ]
      })
    )
  }, auth)
}

const basicHeader = (username: string, password: string) => `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
const stored = (page: Page, storage: 'localStorage' | 'sessionStorage', key: string) =>
  page.evaluate(([storage, key]) => window[storage as 'localStorage'].getItem(key) || '', [storage, key])

const credentialsCard = (page: Page) => page.getByTestId('cluster-credentials')
const credentialsInput = (page: Page, field: string) => page.getByTestId(`cluster-credentials-${field}`)
const login = (page: Page) => page.getByTestId('cluster-credentials-submit').click()
const clusterHome = (page: Page) => page.getByTestId('cluster-status')

test.describe('credentials that are not saved', () => {
  test('asks for the basic auth password once per session', async ({ page }) => {
    const seen = await mockSecuredElastic(page, (headers) => headers.authorization === basicHeader('admin', 'right'))
    await seedCluster(page, {
      authType: 'basicAuth',
      authData: { username: 'admin', password: '' },
      secretStorage: 'session'
    })

    await page.goto(`${APP}/cluster/secure`)
    await expect(credentialsCard(page)).toBeVisible()
    await expect(credentialsInput(page, 'username')).toHaveValue('admin')
    expect(seen).toHaveLength(0)

    await credentialsInput(page, 'password').fill('wrong')
    await login(page)
    await expect(page.getByTestId('cluster-credentials-error')).toContainText('401')

    await credentialsInput(page, 'password').fill('right')
    await login(page)
    await expect(clusterHome(page)).toBeVisible()

    expect(await stored(page, 'localStorage', 'connection')).not.toContain('right')
    expect(await stored(page, 'sessionStorage', 'sessionCredentials')).toContain('right')

    await page.reload()
    await expect(clusterHome(page)).toBeVisible()
    await expect(credentialsCard(page)).toHaveCount(0)
  })

  test('can log in with another username for the session only', async ({ page }) => {
    await mockSecuredElastic(page, (headers) => headers.authorization === basicHeader('admin', 'pw'))
    await seedCluster(page, {
      authType: 'basicAuth',
      authData: { username: 'reader', password: '' },
      secretStorage: 'session'
    })

    await page.goto(`${APP}/cluster/secure`)
    await credentialsInput(page, 'username').fill('admin')
    await credentialsInput(page, 'password').fill('pw')
    await login(page)
    await expect(clusterHome(page)).toBeVisible()

    const connection = JSON.parse(await stored(page, 'localStorage', 'connection'))
    expect(connection.clusters[0].auth.authData).toEqual({ username: 'reader', password: '' })
  })

  test('asks for the api key', async ({ page }) => {
    await mockSecuredElastic(page, (headers) => headers.authorization === 'ApiKey encoded-key')
    await seedCluster(page, { authType: 'apiKey', authData: { apiKey: '' }, secretStorage: 'session' })

    await page.goto(`${APP}/cluster/secure`)
    await credentialsInput(page, 'apiKey').fill('encoded-key')
    await login(page)
    await expect(clusterHome(page)).toBeVisible()

    expect(await stored(page, 'localStorage', 'connection')).not.toContain('encoded-key')
  })

  test('asks for aws secrets and signs REST requests', async ({ page }) => {
    const seen = await mockSecuredElastic(
      page,
      (headers) =>
        headers.authorization?.startsWith('AWS4-HMAC-SHA256 Credential=AKIAE2E/') && headers['x-amz-security-token'] === 'token'
    )
    await seedCluster(page, {
      authType: 'awsIAM',
      authData: { accessKeyId: 'AKIAE2E', secretAccessKey: '', region: 'eu-west-1' },
      secretStorage: 'session'
    })

    await page.goto(`${APP}/cluster/secure`)
    await expect(credentialsInput(page, 'accessKeyId')).toHaveValue('AKIAE2E')
    await credentialsInput(page, 'secretAccessKey').fill('aws-secret')
    await credentialsInput(page, 'sessionToken').fill('token')
    await login(page)
    await expect(clusterHome(page)).toBeVisible()

    const connection = await stored(page, 'localStorage', 'connection')
    expect(connection).not.toContain('aws-secret')
    expect(connection).not.toContain('"token"')

    await page.locator('#rest').click()
    await page.getByTestId('rest-path').fill('rest_e2e/_count')
    await page.locator('#send_request').click()
    await expect(page.getByTestId('rest-response-status')).toContainText('200')

    const restRequest = seen.findLast((request) => request.url.includes('rest_e2e/_count'))
    expect(restRequest?.headers.authorization).toMatch(/^AWS4-HMAC-SHA256 Credential=AKIAE2E\//)
  })

  test('adding a cluster without saving the password keeps it for this tab only', async ({ page, context }) => {
    await mockSecuredElastic(page, (headers) => headers.authorization === basicHeader('elastic', 'secret-pw'))
    await page.addInitScript(() => {
      if (sessionStorage.getItem('seeded')) return
      sessionStorage.setItem('seeded', '1')
      localStorage.clear()
    })

    await page.goto(`${APP}/welcome`)
    await page.locator('#add_cluster').click()
    await page.getByRole('radio', { name: 'Basic auth' }).click()
    await page.getByLabel('Username').fill('elastic')
    await page.getByLabel('Password').fill('secret-pw')
    await page.getByTestId('cluster-save-secrets').click()
    await page.locator('#connect').click()
    await expect(clusterHome(page)).toBeVisible()

    const connection = JSON.parse(await stored(page, 'localStorage', 'connection'))
    expect(connection.clusters[0].auth).toEqual({
      authType: 'basicAuth',
      authData: { username: 'elastic', password: '' },
      secretStorage: 'session'
    })

    const secondTab = await context.newPage()
    await mockSecuredElastic(secondTab, (headers) => headers.authorization === basicHeader('elastic', 'secret-pw'))
    await secondTab.goto(`${APP}/cluster/${connection.clusters[0].id}`)
    await expect(credentialsCard(secondTab)).toBeVisible()
  })

  test('saves passwords by default', async ({ page }) => {
    await mockSecuredElastic(page, (headers) => headers.authorization === basicHeader('elastic', 'saved-pw'))
    await page.addInitScript(() => localStorage.clear())

    await page.goto(`${APP}/welcome`)
    await page.locator('#add_cluster').click()
    await page.getByRole('radio', { name: 'Basic auth' }).click()
    await page.getByLabel('Username').fill('elastic')
    await page.getByLabel('Password').fill('saved-pw')
    await page.locator('#connect').click()
    await expect(clusterHome(page)).toBeVisible()

    expect(await stored(page, 'localStorage', 'connection')).toContain('saved-pw')
  })
})
