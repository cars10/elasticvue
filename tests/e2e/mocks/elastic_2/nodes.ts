import { Page } from '@playwright/test'

export const mockElasticNodes = async (page: Page) => {
  const mocks = {
    catNodes: {
      url: 'http://localhost:9200/_cat/nodes?h=ip%2Cid%2Cname%2Cversion%2Cheap.percent%2Cheap.current%2Cheap.max%2Cram.percent%2Cram.current%2Cram.max%2Cnode.role%2Cmaster%2Ccpu%2Cload_1m%2Cload_5m%2Cload_15m%2Cdisk.used_percent%2Cdisk.used%2Cdisk.total&full_id=true',
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
      url: 'http://localhost:9200/_nodes',
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