import { expect, Page } from '@playwright/test'
import { versionAtLeast } from '../../../src/helpers/minClusterVersion'
import { navigateTo } from '../helpers'

export const securityApiBase = (version: string) => (versionAtLeast(version, '6.6.0') ? '_security' : '_xpack/security')

export const supportsSecurityDeprecated = (version: string) => versionAtLeast(version, '7.6.0')
export const supportsRoleApplications = (version: string) => versionAtLeast(version, '6.4.0')
export const supportsAllowRestrictedIndices = (version: string) => versionAtLeast(version, '6.7.0')
export const supportsRoleDescription = (version: string) => versionAtLeast(version, '8.15.0')

export const openSecurityPage = async (page: Page, child: 'users' | 'roles') => {
  await expect(page.locator('#users')).toBeVisible()
  await navigateTo(page, `/cluster/default-cluster/${child}`)
  await expect(page.getByTestId(`${child}-table`)).toBeVisible()
}
