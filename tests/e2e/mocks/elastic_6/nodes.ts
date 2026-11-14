import { Page } from '@playwright/test'

export const mockElasticNodes = async (page: Page) => {
  const mocks = {
    catNodes: {
      url: /localhost:9200\/_cat\/nodes\?/,
      json: [
        {
          'ip': '192.168.64.4',
          'id': 'o8NZD5umQdiBmKWIXd_Ueg',
          'name': 'es-6-node-2',
          'version': '6.8.2',
          'heap.percent': '57',
          'heap.current': '286.1mb',
          'heap.max': '494.9mb',
          'ram.percent': '69',
          'ram.current': '21.4gb',
          'ram.max': '31.2gb',
          'node.role': 'mdi',
          'master': '-',
          'cpu': '7',
          'load_1m': '1.99',
          'load_5m': '1.39',
          'load_15m': '1.55',
          'disk.used_percent': '39.57',
          'disk.used': '348.8gb',
          'disk.total': '881.6gb'
        },
        {
          'ip': '192.168.64.3',
          'id': 'VPQwd_2ORE284KaE3TQABQ',
          'name': 'es-6-node-1',
          'heap.percent': '58',
          'heap.current': '291.2mb',
          'heap.max': '494.9mb',
          'ram.percent': '69',
          'ram.current': '21.4gb',
          'ram.max': '31.2gb',
          'node.role': 'mdi',
          'master': '*',
          'cpu': '7',
          'load_1m': '1.99',
          'load_5m': '1.39',
          'load_15m': '1.55',
          'disk.used_percent': '39.57',
          'disk.used': '348.8gb',
          'disk.total': '881.6gb'
        }
      ],
    },
    nodes: {
      url: /localhost:9200\/_nodes\/_all\/settings/,
      json: {
        'nodes': {
          'o8NZD5umQdiBmKWIXd_Ueg': {
            'settings': {
              'node': {
                'attr': {
                  'datacenter': 'es6'
                }
              }
            }
          },
          'VPQwd_2ORE284KaE3TQABQ': {
            'settings': {
              'node': {
                'attr': {
                  'datacenter': 'es6'
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