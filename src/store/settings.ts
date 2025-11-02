import { defineStore } from 'pinia'

type SettingsState = {
  checkForUpdates: boolean
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    checkForUpdates: true
  }),
  persist: true
})