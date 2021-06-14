const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })
  await page.goto('http://localhost:8080')
  await page.click('#theme_select')
  await connectWithServer(page)
  await removeSnackbar(page)
  await page.click('i.mdi-close-circle')

  await clickToNavigateAndScreenshot(page, '#navbar_home', 'screenshot_0_home_white.png')
  await page.click('#theme_select')
  await clickToNavigateAndScreenshot(page, '#navbar_nodes', 'screenshot_1_nodes.png')
  await clickToNavigateAndScreenshot(page, ['#navbar_indices', 'button[title="Options"]'], 'screenshot_2_indices.png')
  await clickToNavigateAndScreenshot(page, ['#navbar_indices', 'button[title="Options"]', 'i.mdi-at'], 'screenshot_3_indices.png')
  await page.reload()
  await page.click('#theme_select')
  await clickToNavigateAndScreenshot(page, '#navbar_search', 'screenshot_4_search_dark.png', async page => {
    await page.click('#index-pattern')
    await page.waitForTimeout(50)
    await page.click('input[type="checkbox"]')
    await page.click('#search_submit')
    await page.waitForTimeout(250)
    await page.click('th[aria-label="author_name (author_name.keyword): Not sorted. Activate to sort ascending."')
    await page.waitForTimeout(250)
  })
  await clickToNavigateAndScreenshot(page, '#navbar_query_rest', 'screenshot_5_query_dark.png', async page => {
    await page.focus('#path')
    await page.keyboard.type('_search')
    await page.click('#execute_query')
    await page.waitForTimeout(500)
  })
  await clickToNavigateAndScreenshot(page, ['#navbar_snapshots', '#navbar_snapshots_repositories', 'table tbody tr.tr--clickable'], 'screenshot_6_snapshots_dark.png')
  await clickToNavigateAndScreenshot(page, '#navbar_utilities', 'screenshot_7_utilities_dark.png')
  await clickToNavigateAndScreenshot(page, '#navbar_settings', 'screenshot_8_settings.png')

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

async function clickToNavigateAndScreenshot (page, selectors, screenshot, callback) {
  console.log(screenshot)
  if (Array.isArray(selectors)) {
    for (const selector of selectors) {
      await page.waitForTimeout(200)
      try {
        await page.click(selector)
      } catch (e) {
        console.log('error.', e)
        await page.screenshot({ path: 'scripts/website_screenshots/error.png' })
      }
    }
  } else {
    await page.waitForTimeout(200)
    await page.click(selectors)
  }

  await page.waitForTimeout(500)
  if (typeof callback === 'function') await callback(page)
  await page.screenshot({ path: 'scripts/website_screenshots/' + screenshot })
}
