import { Page } from '@playwright/test'

export const mockElasticNodes = async (page: Page) => {
  const mocks = {
    catNodes: {
      url: 'http://localhost:9200/_cat/nodes?h=ip%2Cid%2Cname%2Cversion%2Cheap.percent%2Cheap.current%2Cheap.max%2Cram.percent%2Cram.current%2Cram.max%2Cnode.role%2Cmaster%2Ccpu%2Cload_1m%2Cload_5m%2Cload_15m%2Cdisk.used_percent%2Cdisk.used%2Cdisk.total&full_id=true',
      json: [
        {
          'ip': '192.168.112.2',
          'id': '80VY7GdJQ266bnC3oX_gSw',
          'name': 'es-5-node-1',
          'version': '5.6.16',
          'heap.percent': '21',
          'heap.current': '431.2mb',
          'heap.max': '1.9gb',
          'ram.percent': '68',
          'ram.current': '21.3gb',
          'ram.max': '31.2gb',
          'node.role': 'mdi',
          'master': '*',
          'cpu': '7',
          'load_1m': '2.40',
          'load_5m': '1.55',
          'load_15m': '1.60',
          'disk.used_percent': '39.57',
          'disk.used': '348.8gb',
          'disk.total': '881.6gb'
        }
      ],
    },
    nodes: {
      url: 'http://localhost:9200/_nodes',
      json: {
        'nodes': {
          '80VY7GdJQ266bnC3oX_gSw': {
            'settings': {
              'node': {
                'attr': {
                  'datacenter': 'es5'
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