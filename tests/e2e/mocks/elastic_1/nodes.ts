import { Page } from '@playwright/test'

export const mockElasticNodes = async (page: Page) => {
  const mocks = {
    catNodes: {
      url: /localhost:9200\/_cat\/nodes\?/,
      json: [
        {
          'ip': '192.168.48.2',
          'id': 'tz7KYbj8RSeyum3J-v4VZQ',
          'name': 'es-1-node-1',
          'version': '1.7.6',
          'heap.percent': '6',
          'heap.current': '59.7mb',
          'heap.max': '989.8mb',
          'ram.percent': '54',
          'ram.current': '21.6gb',
          'ram.max': '31.2gb',
          'node.role': 'd',
          'master': '*'
        }
      ],
    },
    nodes: {
      url: /localhost:9200\/_nodes\/_all\/settings/,
      json: {
        'nodes': {
          'tz7KYbj8RSeyum3J-v4VZQ': {
            'settings': {
              'node': {
                'attr': {
                  'datacenter': 'es1'
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