import { Page } from '@playwright/test'

export const mockElasticNodes = async (page: Page) => {
  const mocks = {
    catNodes: {
      url: /localhost:9200\/_cat\/nodes\?/,
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
      url: /localhost:9200\/_nodes\/_all\/settings/,
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