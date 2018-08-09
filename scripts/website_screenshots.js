const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
  const page = await browser.newPage()
  page.setViewport({width: 1280, height: 800})
  await page.goto('http://localhost:8080')

  await page.click('#theme_select')
  await clickToNavigateAndScreenshot(page, '#navbar_home', 'screenshot_0_connect_white.png')
  await connectWithServer(page)
  await removeSnackbar(page)
  await clickToNavigateAndScreenshot(page, '#navbar_home', 'screenshot_1_home_white.png')
  await clickToNavigateAndScreenshot(page, '#navbar_indices', 'screenshot_2_indices_white.png')
  await clickToNavigateAndScreenshot(page, 'table > tbody > tr:nth-child(1) > td:nth-child(10) > div > button:nth-child(2)', 'screenshot_3_index_white.png')

  await page.click('#theme_select')
  await page.click('#navbar_indices')
  await clickToNavigateAndScreenshot(page, 'table > tbody > tr:nth-child(1) > td:nth-child(10) > div > button:nth-child(2)', 'screenshot_4_index_dark.png')
  await clickToNavigateAndScreenshot(page, '#navbar_search', 'screenshot_5_search_dark.png')
  await clickToNavigateAndScreenshot(page, '#navbar_query', 'screenshot_6_query_dark.png')
  await clickToNavigateAndScreenshot(page, '#navbar_utilities', 'screenshot_7_utilities_dark.png')

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
  await page.waitFor(selector)
  await page.click(selector)
  await page.waitFor(200)
  await page.screenshot({path: 'scripts/website_screenshots/' + screenshot})
}
