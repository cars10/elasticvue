import { genColumns } from '../../../helpers/tableColumns.ts'
import { useTranslation } from '../../i18n.ts'
import { ref } from 'vue'
import {
  AuthType,
  BuildFlavor,
  ElasticsearchCluster,
  ElasticsearchClusterAuth,
  useConnectionStore
} from '../../../store/connection.ts'
import { DEFAULT_CLUSTER_NAME } from '../../../consts.ts'

export type PredefinedCluster = {
  name?: string
  username?: string
  password?: string
  apiKey?: string
  uri: string
  accessKeyId?: string
  secretAccessKey?: string
  sessionToken?: string
  region?: string
}

export const usePredefinedClusters = () => {
  const clusters = ref([])
  const selectedClusters = ref([])

  const dialog = ref(false)

  const loadPredefinedClusters = async () => {
    const response = await fetch('/api/default_clusters.json')
    if (response.status !== 200) return

    const contentType = response.headers.get('Content-Type')
    if (!contentType?.includes('application/json')) return

    const defaultClusters = await response.json()

    clusters.value = defaultClusters
        .filter((cluster: PredefinedCluster) => (cluster.uri && cluster.uri.length > 0))
        .map((cluster: PredefinedCluster) => (Object.assign({}, {
          name: '',
          username: '',
          password: '',
          apiKey: '',
          accessKeyId: '',
          secretAccessKey: '',
          sessionToken: '',
          region: ''
        }, cluster)))
    selectedClusters.value = clusters.value
  }
  loadPredefinedClusters()

  const t = useTranslation()
  const columns = genColumns([
    { label: t('setup.import_predefined_clusters.table.headers.health'), align: 'left' },
    { label: t('setup.import_predefined_clusters.table.headers.cluster_name'), field: 'name', align: 'left' },
    { label: t('setup.import_predefined_clusters.table.headers.uri'), field: 'uri', align: 'left' },
    { label: t('setup.import_predefined_clusters.table.headers.username'), field: 'username', align: 'left' },
    { label: t('setup.import_predefined_clusters.table.headers.password'), field: 'password', align: 'left' }
  ])

  const submit = () => {
    const connectionStore = useConnectionStore()
    const newClusters = importClusters(selectedClusters.value, connectionStore.clusters)
    newClusters.forEach(connectionStore.addCluster)
    window.location.reload()
  }

  return {
    clusters,
    columns,
    dialog,
    selectedClusters,
    submit,
    loadPredefinedClusters
  }
}

export const importClusters = (
    inputClusters: PredefinedCluster[],
    existingClusters: ElasticsearchCluster[]
): ElasticsearchCluster[] => {
  if (inputClusters.length === 0) return []

  const result: ElasticsearchCluster[] = []

  const emptyCluster: Partial<ElasticsearchCluster> = {
    name: '',
    uri: '',
    clusterName: '',
    version: '',
    majorVersion: '',
    distribution: '',
    uuid: '',
    status: '',
    loading: false,
    flavor: BuildFlavor.default
  }

  inputClusters.forEach(predefined => {
    const alreadyExists = existingClusters.some(existing =>
        compareClusters(existing, predefined)
    )

    if (alreadyExists || !predefined.uri?.length) return

    const auth = buildAuth(predefined)

    const newCluster: ElasticsearchCluster = {
      ...emptyCluster,
      ...predefined,
      auth,
      uri: predefined.uri,
      name: predefined.name || DEFAULT_CLUSTER_NAME
    } as ElasticsearchCluster

    result.push(newCluster)
  })

  return result
}

const buildAuth = (cluster: PredefinedCluster): ElasticsearchClusterAuth => {
  const { username, password, apiKey, accessKeyId, secretAccessKey, sessionToken, region } = cluster

  if (username?.length && password?.length) {
    return {
      authType: AuthType.basicAuth,
      authData: { username, password }
    }
  }

  if (password?.length) {
    return {
      authType: AuthType.apiKey,
      authData: { apiKey: password }
    }
  }

  if (apiKey?.length) {
    return {
      authType: AuthType.apiKey,
      authData: { apiKey }
    }
  }

  if (accessKeyId?.length && secretAccessKey?.length && region?.length) {
    return {
      authType: AuthType.awsIAM,
      authData: {
        accessKeyId,
        secretAccessKey,
        sessionToken,
        region
      }
    }
  }

  return {
    authType: AuthType.none,
    authData: undefined
  }
}

const compareClusters = (a: PredefinedCluster, b: PredefinedCluster): boolean => {
  const fieldsToCompare = [
    'name',
    'uri',
    'username',
    'password',
    'apiKey',
    'accessKeyId',
    'secretAccessKey',
    'sessionToken',
    'region'
  ] as const

  return fieldsToCompare.every(field =>
      !a[field] || !b[field] || a[field] === b[field]
  )
}