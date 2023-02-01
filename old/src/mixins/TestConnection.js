import { computed, ref } from 'vue'
import { DEFAULT_ELASTICSEARCH_HOST, DEFAULT_HOST, DEFAULT_NAME } from '@/consts'
import ElasticsearchAdapter from '@/services/ElasticsearchAdapter'
import { DefaultClient } from '@/models/clients/DefaultClient'
import store from '@/store'
import i18n from '@/i18n'
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
    return testState.value.testError ? 'error' : 'primary-button'
  })

  const connectColor = computed(() => {
    return testState.value.testSuccess ? 'success' : 'primary-button'
  })

  const elasticsearchHost = ref(Object.assign({}, DEFAULT_ELASTICSEARCH_HOST))

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
    new ElasticsearchAdapter(new DefaultClient(elasticsearchHost.value)).test()
      .then(() => {
        testState.value.testLoading = false
        testState.value.testSuccess = true
        testState.value.testError = false
        testState.value.connectError = false
        showSuccessSnackbar({
          title: i18n.t('defaults.success'),
          body: i18n.t('mixins.test_connection.cluster_reachable')
        })
      })
      .catch(e => {
        testState.value.testLoading = false
        testState.value.testSuccess = false
        testState.value.testError = true
        if (e instanceof TypeError) {
          testState.value.errorMessage = i18n.t('mixins.test_connection.cluster_not_reachable')
        } else {
          testState.value.errorMessage = e.message
        }
      })
  }

  const connect = () => {
    testState.value.connectLoading = true
    testState.value.connectError = false
    return new ElasticsearchAdapter(new DefaultClient(elasticsearchHost.value)).test()
      .then(() => {
        store.commit('connection/addElasticsearchInstance', {
          name: elasticsearchHost.value.name.trim(),
          username: elasticsearchHost.value.username.trim(),
          password: elasticsearchHost.value.password.trim(),
          uri: elasticsearchHost.value.uri.trim(),
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
