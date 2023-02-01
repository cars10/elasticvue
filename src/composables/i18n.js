import { useI18n } from 'vue-i18n/dist/vue-i18n.cjs'

export const useTranslation = () => {
  const { t } = useI18n()
  return t
}