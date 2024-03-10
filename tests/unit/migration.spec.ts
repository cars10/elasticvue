import { describe, it } from 'vitest'
import { migrateVuexData } from '../../src/services/VuexMigrator'

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
      'distribution': 'elasticsearch',
      'clusterName': '',
      'version': '6.8.2',
      'majorVersion': '6',
      'uuid': '',
      'status': ''
    },
      {
        'name': 'es8',
        'username': 'elastic',
        'password': 'elastic',
        'uri': 'https://localhost:9508',
        'distribution': 'elasticsearch',
        'clusterName': '',
        'version': '8.7.1',
        'majorVersion': '8',
        'uuid': '',
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
    const data = JSON.stringify(vuexData)
    expect(migrateVuexData(data)).toEqual(newData)
  })
})
