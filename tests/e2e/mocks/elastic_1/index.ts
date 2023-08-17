import { Page } from '@playwright/test'
import { mockElastic1Home } from './home'

export const mockElastic1 = async (page: Page, { health }: { health: string } = { health: 'green' }) => {
  await mockElastic1Home(page, { health })
}