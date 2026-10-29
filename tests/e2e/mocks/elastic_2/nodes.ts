import { Page } from '@playwright/test'

export const mockElasticNodes = async (page: Page) => {
  const mocks = {
    catNodes: {
      url: /localhost:9200\/_cat\/nodes\?/,
      json: [
        {
          'ip': '192.168.16.2',
          'id': '0tgdUvIbSOCHzADG18paPQ',
          'name': 'es-2-node-1',
          'version': '2.4.6',
          'heap.percent': '4',
          'heap.current': '47mb',
          'heap.max': '989.8mb',
          'ram.percent': '70',
          'ram.current': '21.7gb',
          'ram.max': '31.2gb',
          'node.role': 'd',
          'master': '*',
          'cpu': '7'
        }
      ],
    },
    nodes: {
      url: /localhost:9200\/_nodes\/_all\/settings/,
      json: {
        'nodes': {
          '0tgdUvIbSOCHzADG18paPQ': {
            'settings': {
              'node': {
                'attr': {
                  'datacenter': 'es2'
                }
              }
            }
          }
        }
      }
    }
  }

  for (const method in mocks) {
    const url = mocks[method as keyof typeof mocks].url
    const json = mocks[method as keyof typeof mocks].json

    await page.route(url, async route => (await route.fulfill({ json })))
  }
}