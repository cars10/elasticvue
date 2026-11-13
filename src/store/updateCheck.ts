import { defineStore } from 'pinia'
import { buildConfig } from '../buildConfig.ts'
import { updateMode } from '../helpers/updateCheck.ts'

export type UpdateStatus = 'idle' | 'checking' | 'up_to_date' | 'available' | 'failed'
export type InstallState = 'idle' | 'downloading' | 'installing' | 'failed'

type UpdateCheckState = {
  autoCheck: boolean
  skippedVersion: string | null
  lastCheckedAt: number | null
  status: UpdateStatus
  availableVersion: string | null
  selfUpdateSupported: boolean
  dialog: boolean
  installState: InstallState
  downloadProgress: number | null
  installError: string
}

export const useUpdateCheckStore = defineStore('updateCheck', {
  state: (): UpdateCheckState => ({
    autoCheck: true,
    skippedVersion: null,
    lastCheckedAt: null,
    status: 'idle',
    availableVersion: null,
    selfUpdateSupported: false,
    dialog: false,
    installState: 'idle',
    downloadProgress: null,
    installError: ''
  }),
  getters: {
    mode: (state) => updateMode(buildConfig.buildMode, state.selfUpdateSupported),
    skipped: (state) => state.status === 'available' && state.availableVersion === state.skippedVersion,
    notify: (state) => state.status === 'available' && state.availableVersion !== state.skippedVersion
  },
  actions: {
    skip() {
      this.skippedVersion = this.availableVersion
      this.dialog = false
    },
    unskip() {
      this.skippedVersion = null
    }
  },
  persist: {
    pick: ['autoCheck', 'skippedVersion', 'lastCheckedAt']
  }
})
