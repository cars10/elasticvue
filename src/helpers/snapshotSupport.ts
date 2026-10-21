import { clusterVersionAtLeast } from './minClusterVersion.ts'
import { useConnectionStore } from '../store/connection.ts'

export const supportsSlm = () => useConnectionStore().elasticsearch && clusterVersionAtLeast('7.4.0')

export const supportsRepositoryVerify = () => clusterVersionAtLeast('1.4.0')
