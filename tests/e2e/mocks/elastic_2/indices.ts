import { Page } from '@playwright/test'

export const mockElasticIndices = async (page: Page) => {
  const mocks = {
    catIndices: {
      url: 'http://localhost:9200/_cat/indices/?h=index%2Chealth%2Cstatus%2Cuuid%2Cpri%2Crep%2Cdocs.count%2Cstore.size&bytes=b',
      json: [
        {
          'index': 'movies',
          'health': 'green',
          'status': 'open',
          'pri': '1',
          'rep': '1',
          'docs.count': 0,
          'store.size': 0
        },
        {
          'index': 'omdb',
          'health': 'green',
          'status': 'open',
          'pri': '1',
          'rep': '1',
          'docs.count': 0,
          'store.size': 0
        }
      ]
    },
  }

  for (const method in mocks) {
    const url = mocks[method].url
    const json = mocks[method].json

    await page.route(url, async route => (await route.fulfill({ json })))
  }
}