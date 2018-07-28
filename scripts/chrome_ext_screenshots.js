const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
  const page = await browser.newPage()
  page.setViewport({width: 1280, height: 800})
  await page.goto('http://localhost:8080')

  await connectWithServer(page)
  await removeSnackbar(page)

  await page.click('#theme_select')
  await clickToNavigateAndScreenshot(page, '#navbar_home', 'screenshot_1_home_white.png')
  await page.click('#theme_select')
  await clickToNavigateAndScreenshot(page, '#navbar_home', 'screenshot_2_home_dark.png')
  await clickToNavigateAndScreenshot(page, '#navbar_indices', 'screenshot_3_indices.png')
  await clickToNavigateAndScreenshot(page, 'table > tbody > tr:nth-child(1) > td:nth-child(10) > div > button:nth-child(2)', 'screenshot_4_index.png')
  await clickToNavigateAndScreenshot(page, '#navbar_query', 'screenshot_5_search.png')

  await browser.close()
})()

async function connectWithServer (page) {
  await page.waitFor('#test_connection')
  await page.click('#test_connection')
  await page.waitFor('#connect:not(.v-btn--disabled)')
  await page.click('#connect')
  await page.waitFor(50)
}

async function removeSnackbar (page) {
  await page.waitFor('.v-snack')
  await page.evaluate(() => {
    let div = document.querySelector('.v-snack')
    div.parentNode.removeChild(div)
  })
}

async function clickToNavigateAndScreenshot (page, selector, screenshot) {
  await page.click(selector)
  await page.waitFor(200)
  await page.screenshot({path: 'tools/chrome_ext_screenshots/' + screenshot})
}
