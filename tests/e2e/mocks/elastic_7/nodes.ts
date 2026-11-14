import { Page } from '@playwright/test'

export const mockElasticNodes = async (page: Page) => {
  const mocks = {
    catNodes: {
      url: /localhost:9200\/_cat\/nodes\?/,
      json: [
        {
          'ip': '192.168.80.2',
          'id': 'g72ugSyySjOyRkmiMQ0zYQ',
          'name': 'es-7-node-1',
          'version': '7.17.10',
          'heap.percent': '33',
          'heap.current': '174mb',
          'heap.max': '512mb',
          'ram.percent': '68',
          'ram.current': '21.3gb',
          'ram.max': '31.2gb',
          'node.role': 'cdfhilmrstw',
          'master': '*',
          'cpu': '5',
          'load_1m': '2.15',
          'load_5m': '1.17',
          'load_15m': '1.53',
          'disk.used_percent': '39.57',
          'disk.used': '348.8gb',
          'disk.total': '881.6gb'
        },
        {
          'ip': '192.168.80.4',
          'id': '_lVq_MPPTd-RefVYhUg0pw',
          'name': 'es-7-node-2',
          'heap.percent': '45',
          'heap.current': '232.1mb',
          'heap.max': '512mb',
          'ram.percent': '68',
          'ram.current': '21.3gb',
          'ram.max': '31.2gb',
          'node.role': 'cdfhilmrstw',
          'master': '-',
          'cpu': '5',
          'load_1m': '2.15',
          'load_5m': '1.17',
          'load_15m': '1.53',
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
          'g72ugSyySjOyRkmiMQ0zYQ': {
            'settings': {
              'node': {
                'attr': {
                  'datacenter': 'es7'
                }
              }
            }
          },
          '_lVq_MPPTd-RefVYhUg0pw': {
            'settings': {
              'node': {
                'attr': {
                  'datacenter': 'es7'
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