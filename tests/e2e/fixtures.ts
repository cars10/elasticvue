import { test as base, expect } from '@playwright/test'

const APP_ORIGINS = ['http://localhost:5175', 'http://localhost:5176']
const UPDATE_CHECK = /^https:\/\/update\.elasticvue\.com\//
const CORS_HEADERS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }

const isAppRequest = (url: URL) => APP_ORIGINS.includes(url.origin) || ['data:', 'blob:'].includes(url.protocol)

export const test = base.extend<{ guard: void }>({
  guard: [
    async ({ context }, use) => {
      const unmocked: string[] = []
      const pageErrors: string[] = []

      await context.route(
        (url) => !isAppRequest(url),
        (route) => {
          const url = route.request().url()
          if (UPDATE_CHECK.test(url)) return route.fulfill({ status: 204, headers: CORS_HEADERS, body: '' })
          unmocked.push(`${route.request().method()} ${url}`)
          return route.abort('connectionrefused')
        }
      )
      context.on('weberror', (error) => pageErrors.push(error.error().message))

      await use()

      expect(unmocked, 'requests without a mock').toEqual([])
      expect(pageErrors, 'uncaught page errors').toEqual([])
    },
    { auto: true }
  ]
})

export { expect }
export type { Page, Route } from '@playwright/test'
