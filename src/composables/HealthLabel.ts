import { useTranslation } from './i18n.ts'

export const useHealthLabel = () => {
  const t = useTranslation()

  return (status?: string | null) =>
    ({
      green: t('home.status.green'),
      yellow: t('home.status.yellow'),
      red: t('home.status.red')
    })[status || ''] ?? t('home.status.unknown')
}
