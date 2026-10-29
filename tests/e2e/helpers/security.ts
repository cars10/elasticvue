import { expect, Page } from '@playwright/test'
import { versionAtLeast } from '../../../src/helpers/minClusterVersion'

export const securityApiBase = (version: string) => (versionAtLeast(version, '6.6.0') ? '_security' : '_xpack/security')

export const supportsNativeSecurityApi = (version: string) => parseInt(version, 10) >= 5
export const supportsUserEnabled = (version: string) => parseInt(version, 10) >= 6
export const supportsSecurityDeprecated = (version: string) => versionAtLeast(version, '7.6.0')
export const supportsRoleApplications = (version: string) => versionAtLeast(version, '6.4.0')
export const supportsAllowRestrictedIndices = (version: string) => versionAtLeast(version, '6.7.0')
export const supportsRoleDescription = (version: string) => versionAtLeast(version, '8.15.0')

export const openSecurityPage = async (page: Page, child: 'users_list' | 'roles') => {
  await page.locator('#users').click()
  // shortcut: firefox can drop the click while the group is still sliding open, so retry until the route changes
  const path = child === 'roles' ? /\/roles$/ : /\/users$/
  await expect(async () => {
    await page.locator(`#${child}`).click()
    await expect(page).toHaveURL(path, { timeout: 1000 })
  }).toPass()
}
