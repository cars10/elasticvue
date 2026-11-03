import { Page } from '@playwright/test'

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

  await page.goto('http://localhost:5175')
}

export const clusterIdAt = async (page: Page, index: number) => {
  return page.evaluate((i) => JSON.parse(window.localStorage.getItem('connection') as string).clusters[i].id, index)
}

export const openElasticvue = (page: Page) => {
  return page.goto('http://localhost:5175/')
}
