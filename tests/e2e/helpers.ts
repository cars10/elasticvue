import { Page } from '@playwright/test'

export const setupClusterConnection = async (page: Page) => {
  await page.addInitScript(() => {
    window.localStorage.clear()

    const connection = {
      'clusters': [
        {
          'name': 'default cluster',
          'uri': 'http://localhost:9200/',
          'status': 'green',
          'clusterName': '',
          'version': '',
          'majorVersion': '',
          'distribution': 'elasticsearch',
          'uuid': '',
          'predefined': false,
          'flavor': 'default',
          'auth': {
            'authType': 'basicAuth',
            'authData': {
              'username': '',
              'password': ''
            }
          }
        },
        {
          'name': 'dev cluster',
          'username': '',
          'password': '',
          'uri': 'http://localhost:9200/',
          'status': 'green',
          'clusterName': '',
          'version': '',
          'majorVersion': '',
          'distribution': 'elasticsearch',
          'uuid': '',
          'predefined': false,
          'flavor': 'default',
          'auth': {
            'authType': 'basicAuth',
            'authData': {
              'username': '',
              'password': ''
            }
          }
        }
      ],
      'activeClusterIndex': 0
    }
    window.localStorage.setItem('connection', JSON.stringify(connection))
  })

  await page.goto('http://localhost:5175')
}

export const openElasticvue = (page: Page) => {
  return page.goto('http://localhost:5175/')
}