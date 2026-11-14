import { Page } from '@playwright/test'

export const APP = 'http://localhost:5175'
export const ES_ROOT = 'http://localhost:9200/'

const clusterInfoSettled = (page: Page) => {
  const response = page.waitForResponse((r) => r.url() === ES_ROOT)
  const failure = page.waitForEvent('requestfailed', (r) => r.url() === ES_ROOT)
  response.catch(() => {})
  failure.catch(() => {})
  return Promise.race([response, failure])
}

export const setupClusterConnection = async (page: Page) => {
  await page.addInitScript(() => {
    window.localStorage.clear()

    const connection = {
      clusters: [
        {
          id: 'default-cluster',
          name: 'default cluster',
          uri: 'http://localhost:9200/',
          status: 'green',
          clusterName: '',
          version: '',
          majorVersion: '',
          distribution: 'elasticsearch',
          uuid: 'ecdKaffmR9WkFbKDW4PUWw',
          predefined: false,
          flavor: 'default',
          auth: {
            authType: 'basicAuth',
            authData: {
              username: '',
              password: ''
            }
          }
        },
        {
          id: 'dev-cluster',
          name: 'dev cluster',
          username: '',
          password: '',
          uri: 'http://localhost:9200/',
          status: 'green',
          clusterName: '',
          version: '',
          majorVersion: '',
          distribution: 'elasticsearch',
          predefined: false,
          flavor: 'default',
          auth: {
            authType: 'basicAuth',
            authData: {
              username: '',
              password: ''
            }
          }
        }
      ],
      activeClusterId: 'default-cluster'
    }
    window.localStorage.setItem('connection', JSON.stringify(connection))
  })

  const settled = clusterInfoSettled(page)
  await page.goto(APP)
  await settled
}

export const clusterIdAt = async (page: Page, index: number) => {
  return page.evaluate((i) => JSON.parse(window.localStorage.getItem('connection') as string).clusters[i].id, index)
}

export const openElasticvue = (page: Page) => {
  return page.goto(`${APP}/`)
}

export const navigateTo = (page: Page, path: string) =>
  page.evaluate((target) => {
    window.history.pushState({}, '', target)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, path)
