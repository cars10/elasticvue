import { defineStore } from 'pinia'

type SurveyState = {
  hidden: boolean
}

export const useSurveyStore = defineStore('survey', {
  state: (): SurveyState => ({
    hidden: false
  }),
  persist: true
})
