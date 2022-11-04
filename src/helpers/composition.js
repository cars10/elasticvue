import { getCurrentInstance } from 'vue'

export function useVuetify () {
  const { proxy } = getCurrentInstance()
  return proxy.$vuetify
}

export function useRouter () {
  const { proxy } = getCurrentInstance()
  return { route: proxy.$route, router: proxy.$router }
}
