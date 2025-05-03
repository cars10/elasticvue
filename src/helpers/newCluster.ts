import { DEFAULT_CLUSTER_NAME, DEFAULT_CLUSTER_URI } from '../consts.ts'
import { BuildFlavor } from '../store/connection.ts'

export const newElasticsearchCluster = () => {
  return {
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
    flavor: BuildFlavor.default
  }
}