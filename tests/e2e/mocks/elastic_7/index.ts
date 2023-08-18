import { Page } from '@playwright/test'
import { mockElastic7Home } from './home'

export const mockElastic7 = async (page: Page, { health }: { health: string } = { health: 'green' }) => {
  await mockElastic7Home(page, { health })
}