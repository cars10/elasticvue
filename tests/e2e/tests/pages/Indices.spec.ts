import { test, expect, Page } from '@playwright/test'
import { setupClusterConnection } from '../../helpers'
import { withElastic } from '../../mocks'
import { mockElastic8 } from '../../mocks/elastic_8'
import { catIndices } from '../../mocks/elastic_8/indices'

test.describe.configure({ mode: 'parallel' })

const setup = async (page: Page, mockElastic: (page: Page) => Promise<void>) => {
  await mockElastic(page)
  await setupClusterConnection(page)
  await page.locator('#indices').click()
  return page.getByTestId('indices-table')
}

test.describe('Indices', () => {
  withElastic(({ mockElastic, elastic }) => {
    test(`shows a list of indices on ${elastic.version}`, async ({ page }) => {
      const table = await setup(page, mockElastic)

      await expect(table).toContainText('movies')
      await expect(table).toContainText('omdb')
    })
  })

  test('can filter indices', async ({ page }) => {
    const table = await setup(page, mockElastic8)

    await expect(table).toContainText('movies')
    await expect(table).toContainText('omdb')

    await page.locator('input[name="filter"]').fill('movies')
    await expect(table).toContainText('movies')
    await expect(table).not.toContainText('omdb')
  })

  test('filters indices by health', async ({ page }) => {
    await mockElastic8(page)
    const [movies, omdb] = catIndices.json
    await page.route(catIndices.url, (route) => route.fulfill({ json: [movies, { ...omdb, health: 'yellow' }] }))
    await setupClusterConnection(page)
    await page.locator('#indices').click()
    const table = page.getByTestId('indices-table')
    await expect(table).toContainText('omdb')

    await page.getByTestId('indices-health-filter').click()
    await page.getByRole('option', { name: 'yellow' }).click()
    await expect(table).toContainText('omdb')
    await expect(table).not.toContainText('movies')
  })

  const setupAddDocument = async (page: Page) => {
    const table = await setup(page, mockElastic8)
    const field = (type: string) => ({ [type]: { type, searchable: true, aggregatable: type !== 'text' } })
    await page.route('http://localhost:9200/movies/_field_caps*', (route) =>
      route.fulfill({
        json: {
          indices: ['movies'],
          fields: {
            title: field('text'),
            'title.keyword': field('keyword'),
            year: field('long'),
            released: field('date'),
            available: field('boolean'),
            location: field('geo_point'),
            'director.name': field('keyword'),
            director: { object: { type: 'object', searchable: false, aggregatable: false } }
          }
        }
      })
    )
    const bodies: string[] = []
    await page.route('http://localhost:9200/movies/_doc**', async (route) => {
      bodies.push(route.request().postData() || '')
      await route.fulfill({ json: { result: 'created' } })
    })

    await table.locator('tr').filter({ hasText: 'movies' }).getByTestId('index-add-document').click()
    return bodies
  }

  test('adds a document with typed inputs per mapped field', async ({ page }) => {
    const bodies = await setupAddDocument(page)
    const input = (name: string) => page.getByTestId(`index-add-document-field-${name}`)

    await expect(page.getByTestId('index-add-document-fields')).toBeVisible()
    await expect(input('title.keyword')).toHaveCount(0)
    await expect(input('year')).toHaveAttribute('type', 'number')
    await expect(input('released')).toHaveAttribute('type', 'datetime-local')

    await input('title').fill('Alien')
    await input('year').fill('1979')
    await input('director.name').fill('Ridley Scott')
    await input('location').fill('{"lat": 1, "lon": 2}')
    await page.getByTestId('index-add-document-submit').click()

    await expect
      .poll(() => bodies[0] && JSON.parse(bodies[0]))
      .toEqual({ director: { name: 'Ridley Scott' }, location: { lat: 1, lon: 2 }, title: 'Alien', year: 1979 })
  })

  test('adds a document as json with a custom id', async ({ page }) => {
    const bodies = await setupAddDocument(page)
    await page.getByTestId('index-add-document-field-title').fill('Up')
    await page.getByTestId('index-add-document-mode').getByText('JSON', { exact: true }).click()

    const editor = page.getByTestId('index-add-document-json').locator('.cm-content')
    await expect(editor).toContainText('"title": "Up"')
    await editor.fill('{"title": "Heat", "year": 1995}')
    await page.getByTestId('index-add-document-id').fill('m 1')
    const request = page.waitForRequest('http://localhost:9200/movies/_doc/m%201?refresh=true')
    await page.getByTestId('index-add-document-submit').click()

    expect((await request).method()).toBe('POST')
    await expect.poll(() => bodies[0] && JSON.parse(bodies[0])).toEqual({ title: 'Heat', year: 1995 })
  })

  test('still lists indices when alias call is forbidden', async ({ page }) => {
    await mockElastic8(page)
    await page.route('http://localhost:9200/*/_alias', async (route) => {
      await route.fulfill({
        status: 403,
        json: {
          error: {
            type: 'security_exception',
            reason: 'no permissions for [indices:admin/aliases/get]'
          },
          status: 403
        }
      })
    })
    await setupClusterConnection(page)
    await page.locator('#indices').click()

    const table = page.getByTestId('indices-table')
    await expect(table).toContainText('movies')
    await expect(table).toContainText('omdb')
    await expect(page.locator('.q-banner')).not.toBeVisible()
  })
})
