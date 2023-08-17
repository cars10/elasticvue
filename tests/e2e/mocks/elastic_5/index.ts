import { Page } from '@playwright/test'
import { mockElastic5Home } from './home'

export const mockElastic5 = async (page: Page, { health }: { health: string } = { health: 'green' }) => {
  await mockElastic5Home(page, { health })
}