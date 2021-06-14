const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  await page.goto('http://localhost:8080')

  await connectWithServer(page)
  await removeSnackbar(page)
  await page.click('i.mdi-close-circle')

  await page.click('#theme_select')
  await page.waitForTimeout(500)
  await clickToNavigateAndScreenshot(page, '#navbar_home', 'screenshot_1_home_white.png')
  await page.click('#theme_select')

  await clickToNavigateAndScreenshot(page, '#navbar_nodes', 'screenshot_2_nodes.png')
  await clickToNavigateAndScreenshot(page, '#navbar_indices', 'screenshot_3_indices.png')
  await clickToNavigateAndScreenshot(page, ['#navbar_search', '#search_submit'], 'screenshot_4_search.png')
  await clickToNavigateAndScreenshot(page, ['#navbar_query_rest', '#example-2', '#execute_query'], 'screenshot_5_query.png')

  await browser.close()
})()

async function connectWithServer (page) {
  await page.waitForSelector('#test_connection')
  await page.click('#test_connection')
  await page.waitForSelector('#connect:not(.v-btn--disabled)')
  await page.click('#connect')
  await page.waitForTimeout(50)
}

async function removeSnackbar (page) {
  await page.waitForSelector('.v-snack')
  await page.evaluate(() => {
    const div = document.querySelector('.v-snack')
    div.parentNode.removeChild(div)
  })
}

async function clickToNavigateAndScreenshot (page, selectors, screenshot) {
  console.log(screenshot)
  if (Array.isArray(selectors)) {
    for (const selector of selectors) {
      await page.click(selector)
      await page.waitForTimeout(50)
    }
  } else {
    await page.click(selectors)
  }
  await page.waitForTimeout(500)
  await page.evaluate(_ => window.scrollTo(0, 0))
  await page.screenshot({ path: 'scripts/chrome_ext_screenshots/' + screenshot })
  await page.waitForTimeout(50)
}
