import { describe, it, expect } from 'vitest'

import { newElasticsearchCluster } from '../../../src/helpers/newCluster'
import { DEFAULT_CLUSTER_NAME, DEFAULT_CLUSTER_URI } from '../../../src/consts.ts'

describe.concurrent('helpers/newCluster.ts', () => {
  describe.concurrent('newCluster.ts newElasticsearchCluster', () => {
    it('should return empty string when supplied with empty string', () => {
      expect(newElasticsearchCluster()).toEqual({
        name: DEFAULT_CLUSTER_NAME,
        distribution: '',
        username: '',
        password: '',
        uri: DEFAULT_CLUSTER_URI,
        clusterName: '',
        version: '',
        majorVersion: '',
        uuid: '',
        status: '',
        flavor: 'default'
      })
    })
  })
})