import { mockElastic1 } from './elastic_1'
import { mockElastic2 } from './elastic_2'
import { mockElastic5 } from './elastic_5'
import { mockElastic6 } from './elastic_6'

const mocks = {
  1: {
    mockElastic: mockElastic1,
    elastic: {
      version: '1.7.6',
      uuid: 'es-1_es-1-node-1'
    }
  },
  2: {
    mockElastic: mockElastic2,
    elastic: {
      version: '2.4.6',
      uuid: 'S2igbCvyRPOh5dy71tgDMw'
    }
  },
  5: {
    mockElastic: mockElastic5,
    elastic: {
      version: '5.6.16',
      uuid: '9IP23Pq4QkOxajqjYiQR3A'
    }
  },
  6: {
    mockElastic: mockElastic6,
    elastic: {
      version: '6.8.2',
      uuid: '8zo4CaCKQHKigIFzjdOPVA'
    }
  }
}

export const withElastic = (callback: any) => {
  for (const major in mocks) {
    callback(mocks[major])
  }
}