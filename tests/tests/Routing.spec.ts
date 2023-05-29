import { test, expect } from '@playwright/test'
import { setupClusterConnection } from '../helpers'
import { mockElastic } from '../mocks/api'

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

    test('root redirects to current cluster if cluster is correct', async ({ page }) => {
      await mockElastic(page)
      await page.addInitScript(() => {
        window.localStorage.clear()

        const connection = {
          'clusters': [
            {
              'name': 'default cluster',
              'username': '',
              'password': '',
              'uri': 'http://localhost:9200',
              'status': 'green'
            },
            {
              'name': 'dev cluster',
              'username': '',
              'password': '',
              'uri': 'http://localhost:9200',
              'status': 'green'
            }
          ],
          'activeClusterIndex': 1
        }
        window.localStorage.setItem('connection', JSON.stringify(connection))
      })

      await page.goto('http://localhost:5173')
      expect(page.url()).toContain('/cluster/1')
    })

    test('root redirects to first cluster if cluster is wrong', async ({ page }) => {
      await mockElastic(page)
      await page.addInitScript(() => {
        window.localStorage.clear()

        const connection = {
          'clusters': [
            {
              'name': 'default cluster',
              'username': '',
              'password': '',
              'uri': 'http://localhost:9200',
              'status': 'green'
            },
            {
              'name': 'dev cluster',
              'username': '',
              'password': '',
              'uri': 'http://localhost:9200',
              'status': 'green'
            }
          ],
          'activeClusterIndex': 1337
        }
        window.localStorage.setItem('connection', JSON.stringify(connection))
      })

      await page.goto('http://localhost:5173')
      expect(page.url()).toContain('/cluster/0')
    })

    test('root redirects to welcome if no cluster exists', async ({ page }) => {
      await mockElastic(page)
      await page.addInitScript(() => {
        window.localStorage.clear()

        const connection = {
          'clusters': [],
          'activeClusterIndex': 0
        }
        window.localStorage.setItem('connection', JSON.stringify(connection))
      })

      await page.goto('http://localhost:5173')
      expect(page.url()).toContain('/welcome')
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