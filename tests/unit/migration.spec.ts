import { describe, it, vi } from 'vitest'
import { migrateVuexData } from '../../src/services/VuexMigrator'
import ElasticsearchAdapter from '../../src/services/ElasticsearchAdapter'

const vuexData = {
  'connection': {
    'instances': [{
      'name': 'default cluster',
      'username': '',
      'password': '',
      'uri': 'http://localhost:9506',
      'status': 'green',
      'version': '6.8.2',
      'major_version': '6'
    }, {
      'name': 'es8',
      'username': 'elastic',
      'password': 'elastic',
      'uri': 'https://localhost:9508',
      'status': 'yellow',
      'version': '8.7.1',
      'major_version': '8'
    }]
  },
  'theme': { 'dark': true },
  'language': { 'language': 'en' },
}

const newData = {
  'connection': {
    'clusters': [{
      'name': 'default cluster',
      'username': '',
      'password': '',
      'uri': 'http://localhost:9506',
      'clusterName': '',
      'version': '6.8.2',
      'majorVersion': '6',
      'uuid': 'D_qHru2wRbSM6kZwsP853Q',
      'status': ''
    },
      {
        'name': 'es8',
        'username': 'elastic',
        'password': 'elastic',
        'uri': 'https://localhost:9508',
        'clusterName': '',
        'version': '8.7.1',
        'majorVersion': '8',
        'uuid': 'D_qHru2wRbSM6kZwsP853Q',
        'status': ''
      }],
    'activeClusterIndex': 0
  },
  'theme': {
    'dark': true
  },
  'language': {
    'language': 'en'
  }
}

describe.concurrent('migrate vuex', () => {
  it('migrate', async ({ expect }) => {
    // Given
    const data = JSON.stringify(vuexData)

    // When
    vi.spyOn(ElasticsearchAdapter.prototype, 'ping').mockResolvedValue({ json: () => ({ cluster_uuid: 'D_qHru2wRbSM6kZwsP853Q' }) });

    // Then
    expect(migrateVuexData(data)).resolves.toStrictEqual(newData)
  })
})
