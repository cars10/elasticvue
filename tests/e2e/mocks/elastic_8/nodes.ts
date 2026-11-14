import { Page } from '@playwright/test'

export const mockElasticNodes = async (page: Page) => {
  const mocks = {
    catNodes: {
      url: /localhost:9200\/_cat\/nodes\?/,
      json: [
        {
          'ip': '192.168.32.2',
          'id': 'hrFoHMcpTD-2QseKkE8W3Q',
          'name': 'es-8-node-1',
          'version': '8.15.0',
          'heap.percent': '45',
          'heap.current': '230.6mb',
          'heap.max': '512mb',
          'ram.percent': '64',
          'ram.current': '20gb',
          'ram.max': '31.2gb',
          'node.role': 'cdfhilmrstw',
          'master': '-',
          'cpu': '3',
          'load_1m': '1.72',
          'load_5m': '2.64',
          'load_15m': '2.29',
          'disk.used_percent': '39.57',
          'disk.used': '348.8gb',
          'disk.total': '881.6gb',
          'shards': '15'
        }
      ],
    },
    nodes: {
      url: /localhost:9200\/_nodes\/_all\/settings/,
      json: {
        'nodes': {
          'hrFoHMcpTD-2QseKkE8W3Q': {
            'settings': {
              'node': {
                'attr': {
                  'datacenter': 'es8'
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