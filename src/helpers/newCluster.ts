import { DEFAULT_CLUSTER_NAME, DEFAULT_CLUSTER_URI } from '../consts.ts'
import { BuildFlavor, ElasticsearchCluster } from '../store/connection.ts'

export const newElasticsearchCluster = (): ElasticsearchCluster => ({
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
  flavor: BuildFlavor.default,
  authType: '' as '' | 'basic' | 'api' | 'aws-iam',
  accessKeyId: '',
  secretAccessKey: '',
  sessionToken: '',
  region: ''
})