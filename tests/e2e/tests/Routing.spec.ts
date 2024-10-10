import { test, expect } from '@playwright/test'
import { setupClusterConnection } from '../helpers'
import { withElastic } from '../mocks'

test.describe.configure({ mode: 'parallel' });

withElastic(({ mockElastic, elastic }) => {
  test.describe(`elasticsearch ${elastic.version}`, () => {
    test.describe('Routing', () => {
      test.describe('empty state', () => {
        test('redirects to /welcome', async ({ page }) => {
          await page.goto('http://localhost:5175/')
          expect(page.url()).toContain('/welcome')
        })

        test('wrong url redirects to /welcome', async ({ page }) => {
          await page.goto('http://localhost:5175/foo')
          expect(page.url()).toContain('/welcome')
        })

        test('wrong cluster id redirects to /welcome', async ({ page }) => {
          await page.goto('http://localhost:5175/cluster/42')
          expect(page.url()).toContain('/welcome')
        })

        test('can open /welcome', async ({ page }) => {
          await page.goto('http://localhost:5175/welcome')
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
          await page.goto('http://localhost:5175/welcome')
          expect(page.url()).not.toContain('/welcome')
        })

        test('welcome redirects to current cluster if cluster is correct', async ({ page }) => {
          await setupClusterConnection(page)
          await page.goto('http://localhost:5175/welcome')
          expect(page.url()).toContain('/cluster/0')
        })

        test('root redirects to current cluster if cluster is correct', async ({ page }) => {
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

          await mockElastic(page)
          await page.goto('http://localhost:5175')
          expect(page.url()).toContain('/cluster/1')
        })

        test('root redirects to first cluster if cluster is wrong', async ({ page }) => {
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

          await mockElastic(page)
          await page.goto('http://localhost:5175')
          expect(page.url()).toContain('/cluster/0')
        })

        test('root redirects to welcome if no cluster exists', async ({ page }) => {
          await page.addInitScript(() => {
            window.localStorage.clear()

            const connection = {
              'clusters': [],
              'activeClusterIndex': 0
            }
            window.localStorage.setItem('connection', JSON.stringify(connection))
          })

          await mockElastic(page)
          await page.goto('http://localhost:5175')
          expect(page.url()).toContain('/welcome')
        })

        test('can access existing clusters', async ({ page }) => {
          await setupClusterConnection(page)

          await page.goto('http://localhost:5175/cluster/0')
          expect(page.url()).toContain('/cluster/0')

          await page.goto('http://localhost:5175/cluster/1')
          expect(page.url()).toContain('/cluster/1')
        })

        test('redirects for non-existing clusters', async ({ page }) => {
          await setupClusterConnection(page)

          const invalids = [42, '42', true, 'true', 'hello', null, '']

          for (const value of invalids) {
            await page.goto(`http://localhost:5175/cluster/${value}`)
            await page.waitForURL('**/cluster/0')
            expect(page.url()).toContain('/cluster/0')
          }
        })
      })
    })
  })
})