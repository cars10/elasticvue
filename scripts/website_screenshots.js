const { chromium } = require('@playwright/test')
const { mock } = require('./mock');

(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1920, height: 1080 })
  await mock(page)

  await page.goto('http://localhost:5173')
  await lightTheme(page)
  await connectWithServer(page)

  await createScreenshots(page)

  await darkTheme(page)
  counter = 1

  await createScreenshots(page)

  await browser.close()
})()

const createScreenshots = async (page) => {
  await page.goto('http://localhost:5173')

  await screenshotHome(page)
  await screenshotNodes(page)
  await screenshotShards(page)
  await screenshotIndices(page)
  await screenshotIndexAliases(page)
  await screenshotSearch(page)
  await screenshotEditDocument(page)
  await screenshotRest(page)
  await screenshotSettings(page)
}

let counter = 1

const screenshotHome = async page => (await screenshot(page, 'home'))
const screenshotNodes = async page => (await navAndScreenshot(page, '#nodes', 'nodes'))
const screenshotShards = async page => (await navAndScreenshot(page, '#shards', 'shards'))
const screenshotIndices = async page => {
  await page.locator('#indices').click()
  await page.locator('table tbody tr').nth(2).locator('.q-btn').last().click()
  await page.waitForTimeout(150)
  await screenshot(page, 'indices', true)
}
const screenshotIndexAliases = async page => {
  await page.locator('div.q-item__label').filter({ hasText: 'Aliases' }).click()
  await page.waitForTimeout(200)
  await screenshot(page, 'index-aliases')
  await page.locator('#close').click()
}
const screenshotSearch = async page => (await navAndScreenshot(page, '#search', 'search', true))
const screenshotEditDocument = async page => {
  await page.locator('body').dblclick()
  await page.waitForSelector('#close')

  await navAndScreenshot(page, 'body', 'document')
  await page.locator('#close').click()
}
const screenshotRest = async page => {
  await page.locator('#rest').click()
  await page.locator('input[name="path"]').fill('_flush')
  await navAndScreenshot(page, '#send_request', 'rest')
}
const screenshotSettings = async page => (await navAndScreenshot(page, '#settings', 'settings'))

const darkTheme = async page => {
  await page.locator('[data-testid="change-theme-button"]').click()
  await page.locator('[data-testid="change-theme__dark"]').click()
}

const lightTheme = async page => {
  await page.locator('[data-testid="change-theme-button"]').click()
  await page.locator('[data-testid="change-theme__light"]').click()
}

const connectWithServer = async page => {
  await page.locator('#add_cluster').click()
  await page.locator('#connect').click()
  await page.waitForURL('http://localhost:5173/cluster/0')
}

const navAndScreenshot = async (page, selector, name, persisted) => {
  await page.locator(selector).click()
  await screenshot(page, name, persisted)
}

const getTheme = async (page) => {
  return await page.evaluate(() => {
    return document.body.classList.contains('theme--dark')
  })
}

const removeVersion = async page => {
  await page.evaluate(() => {
    const version = document.querySelector('#version')
    if (version) version.remove()
  })
}

const screenshot = async (page, name, persisted) => {
  if (!persisted) await page.locator('body').click()
  await removeVersion(page)
  await page.waitForTimeout(200)
  const dark = await getTheme(page)
  const path = `scripts/screenshots/website_${counter}_${name}_${dark ? 'dark' : 'light'}.png`
  await page.screenshot({ path })
  console.log(path)
  counter++
}