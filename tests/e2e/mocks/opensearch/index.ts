import { Page } from '@playwright/test'
import { mockElasticHome } from './home'
import { mockElasticNodes } from './nodes'
import { catIndices, catAliases } from '../default/indices'
import { clusterDefaults } from '../default/cluster'

export const mockOpensearch = (version: string) => async (page: Page, { health }: { health: string } = { health: 'green' }) => {
  await mockElasticHome(page, version, { health })
  await mockElasticNodes(page, version)

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
