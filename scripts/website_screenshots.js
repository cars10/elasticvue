const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()
  page.setViewport({ width: 1920, height: 1080 })
  await page.goto('http://localhost:8080')

  await page.click('#theme_select')
  await clickToNavigateAndScreenshot(page, '#navbar_home', 'screenshot_0_connect_white.jpg')
  await connectWithServer(page)
  await removeSnackbar(page)
  await clickToNavigateAndScreenshot(page, '#navbar_home', 'screenshot_1_home_white.jpg')
  await page.click('#theme_select')
  await clickToNavigateAndScreenshot(page, '#navbar_nodes', 'screenshot_2_nodes.jpg')
  await clickToNavigateAndScreenshot(page, '#navbar_indices', 'screenshot_3_indices.jpg')
  await clickToNavigateAndScreenshot(page, ['button[title="Options"]', 'a[href$="/stats"]'], 'screenshot_4_index.jpg')

  await page.reload()
  await clickToNavigateAndScreenshot(page, '#navbar_search', 'screenshot_5_search_dark.jpg', async page => {
    await page.click('#indices')
    await page.waitFor(50)
    await page.click('input[type="checkbox"]')
    await page.click('#search_submit')
    await page.waitFor(250)
    await page.click('th[aria-label="author_name: Not sorted. Activate to sort ascending."')
    await page.waitFor(250)
  })
  await clickToNavigateAndScreenshot(page, ['#navbar_query', '#navbar_query_rest'], 'screenshot_6_query_dark.jpg', async page => {
    await page.click('#execute_query')
    await page.waitFor(500)
  })
  await clickToNavigateAndScreenshot(page, '#navbar_utilities', 'screenshot_7_utilities_dark.jpg')

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

async function clickToNavigateAndScreenshot (page, selectors, screenshot, callback) {
  if (Array.isArray(selectors)) {
    for (let selector of selectors) {
      await page.waitFor(200)
      await page.click(selector)
    }
  } else {
    await page.waitFor(200)
    await page.click(selectors)
  }

  await page.waitFor(500)
  if (typeof callback === 'function') await callback(page)
  await page.screenshot({ path: 'scripts/website_screenshots/' + screenshot })
}
