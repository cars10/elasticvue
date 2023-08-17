import { Page } from '@playwright/test'
import { mockElastic2Home } from './home'

export const mockElastic2 = async (page: Page, { health }: { health: string } = { health: 'green' }) => {
  await mockElastic2Home(page, { health })
}