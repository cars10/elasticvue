import { Page } from '@playwright/test'

export const setupClusterConnection = async (page: Page) => {
  await page.addInitScript(() => {
    window.localStorage.clear()

    const connection = {
      'clusters': [
        {
          'name': 'default cluster',
          'username': '',
          'password': '',
          'uri': 'http://localhost:9200',
          'status': 'green'
        },
        {
          'name': 'dev cluster',
          'username': '',
          'password': '',
          'uri': 'http://localhost:9200/',
          'status': 'green'
        }
      ],
      'activeClusterIndex': 0
    }
    window.localStorage.setItem('connection', JSON.stringify(connection))
    window.localStorage.setItem('theme', '{"dark":true}')
  })

  await page.goto('http://localhost:5175')
}

export const openElasticvue = page => {
  return page.goto('http://localhost:5175/')
}