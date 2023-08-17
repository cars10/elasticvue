import { Page } from '@playwright/test'
import { mockElastic6Home } from './home'

export const mockElastic6 = async (page: Page, { health }: { health: string } = { health: 'green' }) => {
  await mockElastic6Home(page, { health })
}