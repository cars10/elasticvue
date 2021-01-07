import { computed, ref } from '@vue/composition-api'
import { CONNECTION_STATES, DEFAULT_HOST, DEFAULT_NAME } from '@/consts'
import ElasticsearchAdapter from '@/services/ElasticsearchAdapter'
import { DefaultClient } from '@/models/clients/DefaultClient'
import store from '@/store'
import { showSuccessSnackbar } from '@/mixins/ShowSnackbar'

export const useTestConnection = () => {
  const testState = ref({
    testError: false,
    testSuccess: false,
    testLoading: false,
    connectLoading: false,
    connectError: false,
    errorMessage: ''
  })

  const hasError = computed(() => {
    return testState.value.testError || testState.value.connectError
  })

  const testConnectionColor = computed(() => {
    return testState.value.testError ? 'error' : 'primary'
  })

  const connectColor = computed(() => {
    return testState.value.testSuccess ? 'success' : 'primary'
  })

  const elasticsearchHost = ref({ name: DEFAULT_NAME, uri: DEFAULT_HOST, status: CONNECTION_STATES.UNKNOWN })

  const validName = name => ((name && name.length > 0) || 'Invalid name')
  const validUri = uri => {
    try {
      // eslint-disable-next-line no-new
      new URL(uri)
      if (/^https?:\/\/.*/.test(uri)) return true
    } catch (e) {
    }
    return 'Invalid uri'
  }

  const resetElasticsearchHost = () => {
    testState.value.connectError = false
    testState.value.connectLoading = false
    testState.value.testError = false
    testState.value.testSuccess = false
    testState.value.testLoading = false
    elasticsearchHost.value.name = DEFAULT_NAME
    elasticsearchHost.value.uri = DEFAULT_HOST
  }

  const testConnection = () => {
    testState.value.testLoading = true
    testState.value.testSuccess = false
    testState.value.testError = false
    new ElasticsearchAdapter(new DefaultClient(elasticsearchHost.value.uri)).test()
      .then(() => {
        testState.value.testLoading = false
        testState.value.testSuccess = true
        testState.value.testError = false
        testState.value.connectError = false
        showSuccessSnackbar({
          text: 'Success',
          additionalText: 'You cluster is reachable and configured correctly.'
        })
      })
      .catch(e => {
        testState.value.testLoading = false
        testState.value.testSuccess = false
        testState.value.testError = true
        if (e instanceof TypeError) {
          testState.value.errorMessage = 'Either your cluster is not reachable or you did not configure CORS correctly.'
        } else {
          testState.value.errorMessage = e.message
        }
      })
  }

  const connect = () => {
    testState.value.connectLoading = true
    testState.value.connectError = false
    return new ElasticsearchAdapter(new DefaultClient(elasticsearchHost.value.uri)).test()
      .then(() => {
        store.commit('connection/addElasticsearchInstance', {
          name: elasticsearchHost.value.name,
          uri: elasticsearchHost.value.uri,
          status: elasticsearchHost.value.status
        })
        elasticsearchHost.value.name = DEFAULT_NAME
        elasticsearchHost.value.uri = DEFAULT_HOST
      })
      .catch(() => {
        testState.value.connectLoading = false
        testState.value.connectError = true
      })
  }

  return {
    testState,
    hasError,
    testConnectionColor,
    connectColor,
    elasticsearchHost,
    validName,
    validUri,
    resetElasticsearchHost,
    testConnection,
    connect
  }
}
