import { Page } from '@playwright/test'
import { mockElasticHome } from './home'
import { mockElasticNodes } from './nodes'
import { catIndices, catAliases } from '../default/indices'
import { clusterDefaults } from '../default/cluster'
import { buildSecurityUsers, buildSecurityRoles } from '../default/users'

const VERSION = '7.17.10'

export const mockElastic7 = async (page: Page, { health }: { health: string } = { health: 'green' }) => {
  await mockElasticHome(page, { health })
  await mockElasticNodes(page)

  const defaultMocks = {
    ...clusterDefaults,
    catIndices,
    catAliases,
    securityUsers: buildSecurityUsers(VERSION),
    securityRoles: buildSecurityRoles(VERSION)
  }

  for (const method in defaultMocks) {
    const url = defaultMocks[method].url
    const json = defaultMocks[method].json

    await page.route(url, async (route) => await route.fulfill({ json }))
  }
}
