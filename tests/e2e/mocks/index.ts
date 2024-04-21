import { mockElastic1 } from './elastic_1'
import { mockElastic2 } from './elastic_2'
import { mockElastic5 } from './elastic_5'
import { mockElastic6 } from './elastic_6'
import { mockElastic7 } from './elastic_7'
import { mockElastic8 } from './elastic_8'
import { mockOpensearch2 } from './opensearch_2'

const mocks = {
  1: {
    mockElastic: mockElastic1,
    elastic: {
      version: '1.7.6',
      uuid: 'es-1_es-1-node-1',
      node: 'es-1-node-1'
    }
  },
  2: {
    mockElastic: mockElastic2,
    elastic: {
      version: '2.4.6',
      uuid: 'S2igbCvyRPOh5dy71tgDMw',
      node: 'es-2-node-1'
    }
  },
  5: {
    mockElastic: mockElastic5,
    elastic: {
      version: '5.6.16',
      uuid: '9IP23Pq4QkOxajqjYiQR3A',
      node: 'es-5-node-1'
    }
  },
  6: {
    mockElastic: mockElastic6,
    elastic: {
      version: '6.8.2',
      uuid: '8zo4CaCKQHKigIFzjdOPVA',
      node: 'es-6-node-1'
    }
  },
  7: {
    mockElastic: mockElastic7,
    elastic: {
      version: '7.17.10',
      uuid: 'S3K3y-CNQaub_lLzyOv2Vg',
      node: 'es-7-node-1'
    }
  },
  8: {
    mockElastic: mockElastic8,
    elastic: {
      version: '8.7.1',
      uuid: 'ecdKaffmR9WkFbKDW4PUWw',
      node: 'es-8-node-1'
    }
  },
  'opensearch-2': {
    mockElastic: mockOpensearch2,
    elastic: {
      version: '2.12.0',
      uuid: 'UvzUYrtkR92Hy4N-eq_u-A',
      node: 'os-2-node-1'
    }
  }
}

export const withElastic = (callback: any) => {
  for (const major in mocks) {
    callback(mocks[major])
  }
}