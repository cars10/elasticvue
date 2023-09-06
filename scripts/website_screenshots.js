const { chromium } = require('@playwright/test');
const { mock } = require('./mock');

(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1920, height: 1080 })
  await mock(page)

  await page.goto('http://localhost:5173')
  await connectWithServer(page)

  await screenshotHome(page)
  await toggleTheme(page)
  await screenshotNodes(page)
  await screenshotShards(page)
  await screenshotIndices(page)
  await screenshotIndexAliases(page)
  await screenshotSearch(page)
  await screenshotEditDocument(page)
  await screenshotRest(page)
  await screenshotSettings(page)

  await browser.close()
})()

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
  await navAndScreenshot(page, 'body', 'document')
  await page.locator('#close').click()
}
const screenshotRest = async page => {
  await page.locator('#rest').click()
  await page.locator('input[name="path"]').fill('_flush')
  await navAndScreenshot(page, '#send_request', 'rest')
}
const screenshotSettings = async page => (await navAndScreenshot(page, '#settings', 'settings'))

const toggleTheme = async page => {
  await page.locator('#change_theme').click()
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

const closeSnackbar = async page => {
  await page.locator('#close_snackbar').click()
}

let counter = 1
const screenshot = async (page, name, persisted) => {
  if (!persisted) await page.locator('body').click()
  await page.waitForTimeout(200)
  const path = `scripts/screenshots/website-${counter}-${name}.png`
  await page.screenshot({ path })
  console.log(path)
  counter++
}