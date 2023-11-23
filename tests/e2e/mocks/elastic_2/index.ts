import { Page } from '@playwright/test'
import { mockElasticHome } from './home'
import { mockElasticNodes } from './nodes'
import { mockElasticIndices } from '../elastic_1/indices'

export const mockElastic2 = async (page: Page, { health }: { health: string } = { health: 'green' }) => {
  await mockElasticHome(page, { health })
  await mockElasticNodes(page)
  await mockElasticIndices(page)
}