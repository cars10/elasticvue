import { Page } from '@playwright/test'
import { mockElastic8Home } from './home'

export const mockElastic8 = async (page: Page, { health }: { health: string } = { health: 'green' }) => {
  await mockElastic8Home(page, { health })
}