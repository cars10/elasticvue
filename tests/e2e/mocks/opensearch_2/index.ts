import { Page } from '@playwright/test'
import { mockElasticHome } from './home'
import { mockElasticNodes } from './nodes'
import { catIndices, catAliases } from '../default/indices'
import { clusterDefaults } from '../default/cluster'

export const mockOpensearch2 = async (page: Page, { health }: { health: string } = { health: 'green' }) => {
  await mockElasticHome(page, { health })
  await mockElasticNodes(page)

  const defaultMocks = {
    ...clusterDefaults,
    catIndices,
    catAliases
  }

  for (const method in defaultMocks) {
    const url = defaultMocks[method].url
    const json = defaultMocks[method].json

    await page.route(url, async (route) => await route.fulfill({ json }))
  }
}
