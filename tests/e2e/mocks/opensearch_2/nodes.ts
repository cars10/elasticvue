import { Page } from '@playwright/test'

export const mockElasticNodes = async (page: Page) => {
  const mocks = {
    catNodes: {
      url: 'http://localhost:9200/_cat/nodes?h=ip%2Cid%2Cname%2Cversion%2Cheap.percent%2Cheap.current%2Cheap.max%2Cram.percent%2Cram.current%2Cram.max%2Cnode.role%2Cmaster%2Ccpu%2Cload_1m%2Cload_5m%2Cload_15m%2Cdisk.used_percent%2Cdisk.used%2Cdisk.total&full_id=true',
      json: [
        {
          'ip': '172.29.0.3',
          'id': 'Bz4ySsbHRlC_EDCto_6lLw',
          'name': 'os-2-node-2',
          'heap.percent': '51',
          'heap.current': '265.8mb',
          'heap.max': '512mb',
          'ram.percent': '74',
          'ram.current': '23.1gb',
          'ram.max': '31.2gb',
          'node.role': 'dimr',
          'master': '-',
          'cpu': '2',
          'load_1m': '0.27',
          'load_5m': '0.65',
          'load_15m': '1.01',
          'disk.used_percent': '31.21',
          'disk.used': '274.9gb',
          'disk.total': '880.9gb'
        },
        {
          'ip': '172.29.0.2',
          'id': 'Ou81YfO-TjSRtx2V6akoiA',
          'name': 'os-2-node-1',
          'heap.percent': '24',
          'heap.current': '125.2mb',
          'heap.max': '512mb',
          'ram.percent': '74',
          'ram.current': '23.1gb',
          'ram.max': '31.2gb',
          'node.role': 'dimr',
          'master': '*',
          'cpu': '2',
          'load_1m': '0.27',
          'load_5m': '0.65',
          'load_15m': '1.01',
          'disk.used_percent': '31.21',
          'disk.used': '274.9gb',
          'disk.total': '880.9gb'
        }
      ]
    },
    nodes: {
      url: 'http://localhost:9200/_nodes',
      json: {
        'nodes': {
          'Bz4ySsbHRlC_EDCto_6lLw': {
            'settings': {
              'node': {
                'attr': {
                  'datacenter': 'foo'
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