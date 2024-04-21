import { Page } from '@playwright/test'
import { mockElasticHome } from './home'
import { mockElasticNodes } from './nodes'
import { catIndices } from '../default/indices'

export const mockOpensearch2 = async (page: Page, { health }: { health: string } = { health: 'green' }) => {
  await mockElasticHome(page, { health })
  await mockElasticNodes(page)

  const defaultMocks = {
    catIndices
  }

  for (const method in defaultMocks) {
    const url = defaultMocks[method].url
    const json = defaultMocks[method].json

    await page.route(url, async route => (await route.fulfill({ json })))
  }
}