const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1280, height: 800 })

  await page.goto('http://localhost:5173')
  await connectWithServer(page)

  await screenshot(page, 'home')
  await page.locator('#change_theme').click()
  await navAndScreenshot(page, '#shards', 'shards')
  await navAndScreenshot(page, '#indices', 'indices')
  await navAndScreenshot(page, '#search', 'search')

  await page.locator('#rest').click()
  await page.locator('input[name="path"]').fill('_flush')
  await navAndScreenshot(page, '#send_request', 'rest')

  await browser.close()
})()

const connectWithServer = async page => {
  await page.locator('#add_cluster').click()
  await page.locator('input[name="uri"]').fill('http://localhost:9507')
  await page.locator('#connect').click()
  await page.waitForURL('http://localhost:5173/cluster/0')
}

const navAndScreenshot = async (page, selector, name) => {
  await page.locator(selector).click()
  await screenshot(page, name)
}

const closeSnackbar = async page => {
  await page.locator('#close_snackbar').click()
}

let counter = 1
const screenshot = async (page, name) => {
  await page.locator('body').click()
  await page.waitForTimeout(100)
  const path = `scripts/screenshots/ext-${counter}-${name}.png`
  await page.screenshot({ path })
  console.log(path)
  counter++
}