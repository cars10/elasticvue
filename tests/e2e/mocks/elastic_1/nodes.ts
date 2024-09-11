import { Page } from '@playwright/test'

export const mockElasticNodes = async (page: Page) => {
  const mocks = {
    catNodes: {
      url: 'http://localhost:9200/_cat/nodes?h=ip%2Cid%2Cname%2Cversion%2Cheap.percent%2Cheap.current%2Cheap.max%2Cram.percent%2Cram.current%2Cram.max%2Cnode.role%2Cmaster%2Ccpu%2Cload_1m%2Cload_5m%2Cload_15m%2Cdisk.used_percent%2Cdisk.used%2Cdisk.total&full_id=true',
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
      url: 'http://localhost:9200/_nodes',
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