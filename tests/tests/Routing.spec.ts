import { test, expect } from '@playwright/test'
import { setupClusterConnection } from '../helpers'

test.describe('Routing', () => {
  test.describe('empty state', () => {
    test('redirects to /welcome', async ({ page }) => {
      await page.goto('http://localhost:5173/')
      expect(page.url()).toContain('/welcome')
    })

    test('wrong url redirects to /welcome', async ({ page }) => {
      await page.goto('http://localhost:5173/foo')
      expect(page.url()).toContain('/welcome')
    })

    test('wrong cluster id redirects to /welcome', async ({ page }) => {
      await page.goto('http://localhost:5173/cluster/42')
      expect(page.url()).toContain('/welcome')
    })

    test('can open /welcome', async ({ page }) => {
      await page.goto('http://localhost:5173/welcome')
      expect(page.url()).toContain('/welcome')
    })
  })

  test.describe('existing connections', () => {
    test('does not redirect to /welcome', async ({ page }) => {
      await setupClusterConnection(page)
      expect(page.url()).not.toContain('/welcome')
    })

    test('cannot open /welcome', async ({ page }) => {
      await setupClusterConnection(page)
      await page.goto('http://localhost:5173/welcome')
      expect(page.url()).not.toContain('/welcome')
    })

    test('welcome redirects to current cluster if cluster is correct', async ({ page }) => {
      await setupClusterConnection(page)
      await page.goto('http://localhost:5173/welcome')
      expect(page.url()).toContain('/cluster/0')
    })

    //test('cannot visit /welcome', async ({ page }) => {
    //  await setupClusterConnection(page)
    //  await page.goto('http://localhost:5173/welcome')
    //  expect(page.url()).not.toContain('/welcome')
    //})

    test('can access existing clusters', async ({ page }) => {
      await setupClusterConnection(page)

      await page.goto('http://localhost:5173/cluster/0')
      expect(page.url()).toContain('/cluster/0')

      await page.goto('http://localhost:5173/cluster/1')
      expect(page.url()).toContain('/cluster/1')
    })

    test('redirects for non-existing clusters', async ({ page }) => {
      await setupClusterConnection(page)

      const invalids = [42, '42', true, 'true', 'hello', null, '']

      for (const value of invalids) {
        await page.goto(`http://localhost:5173/cluster/${value}`)
        expect(page.url()).toContain('/cluster/0')
      }
    })
  })
})