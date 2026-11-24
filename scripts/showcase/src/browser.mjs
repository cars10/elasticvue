import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync } from 'node:fs'
import { chromium } from 'playwright'
import { CLUSTERS, sleep } from './elasticsearch.mjs'

export const APP_URL = 'http://elasticvue:8080'
export const OUTPUT = '/app/output'
export const SCREEN = { width: 1920, height: 1080 }
const VIDEO_SCALE = 2

const messages = JSON.parse(readFileSync(new URL('../en.json', import.meta.url), 'utf8'))

export const t = (key) => {
  const value = key.split('.').reduce((node, part) => node?.[part], messages)
  if (typeof value !== 'string') throw new Error(`translation "${key}" not found in en.json`)
  return value
}

export const exact = (page, text) => page.getByText(text, { exact: true })

export const open = (page, route, cluster = 'production') => page.goto(`${APP_URL}/cluster/${cluster}/${route}`)

export const settle = async (page, ms = 800) => {
  await page
    .waitForFunction(() => !document.querySelector('.q-skeleton, .q-spinner, .q-inner-loading'), null, { timeout: 15000 })
    .catch(() => console.warn('  page still shows loading indicators, continuing'))
  await page.waitForTimeout(ms)
}

export const waitWithProgress = async (page, seconds, label) => {
  for (let left = seconds; left > 0; left -= 10) {
    console.log(`  ${label}: ${left}s left`)
    await page.waitForTimeout(Math.min(left, 10) * 1000)
  }
}

const hideBetaBanner = () => {
  const add = () => {
    const style = document.createElement('style')
    style.textContent = '.q-header:has([data-testid="beta-banner"]) { display: none !important }'
    document.head.appendChild(style)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add)
  else add()
}

const ES_VERSION = process.env.ES_VERSION || '9.5.3'

const CONNECTION = {
  clusters: Object.entries(CLUSTERS).map(([name, { nodes, auth }]) => ({
    id: name,
    name,
    uri: nodes[0],
    clusterName: name,
    version: ES_VERSION,
    majorVersion: ES_VERSION.split('.')[0],
    distribution: 'elasticsearch',
    status: '',
    loading: false,
    predefined: true,
    flavor: 'default',
    auth: auth ? { authType: 'basicAuth', authData: auth } : { authType: 'none', authData: {} }
  })),
  activeClusterId: 'production'
}

const STORES = {
  clusters: { reloadInterval: 5 },
  'shardRecovery-production': { activeOnly: false },
  'indexTemplates-production': { filter: 'logs' },
  ...Object.fromEntries(Object.keys(CLUSTERS).flatMap((id) => [[`home-${id}`, { reloadInterval: 5 }], [`tasks-${id}`, { reloadInterval: 5 }]]))
}

const presetStorage = ({ connection, stores }) => {
  if (localStorage.getItem('connection')) return
  localStorage.setItem('connection', JSON.stringify(connection))
  for (const [key, value] of Object.entries(stores)) localStorage.setItem(key, JSON.stringify(value))
}

export const setupContext = async (context) => {
  await context.addInitScript(hideBetaBanner)
  await context.addInitScript(presetStorage, { connection: CONNECTION, stores: STORES })
}

const fakeCursor = () => {
  const stroke = 'fill="#fff" stroke="#000" stroke-width="1.5" stroke-linejoin="round"'
  const shapes = {
    default: { x: 3, y: 2, path: `<path d="M3 2v18l5-4.5 3.5 7 2.6-1.2-3.4-6.8H17z" ${stroke}/>` },
    pointer: {
      x: 9,
      y: 1,
      path: `<path d="M7.5 2.5a1.5 1.5 0 0 1 3 0V9h1V7.5a1.5 1.5 0 0 1 3 0V10h1V8.5a1.5 1.5 0 0 1 3 0V11h1V10a1.5 1.5 0 0 1 3 0v5c0 4-2.5 7-6.5 7h-2c-2.2 0-3.5-.9-4.7-2.5l-4-5.4a1.6 1.6 0 0 1 2.5-2l1.7 2z" ${stroke}/>`
    },
    text: { x: 12, y: 12, path: '<path d="M8 3h3l1 1 1-1h3M12 4v16M8 21h3l1-1 1 1h3" fill="none" stroke="#000" stroke-width="3.5"/><path d="M8 3h3l1 1 1-1h3M12 4v16M8 21h3l1-1 1 1h3" fill="none" stroke="#fff" stroke-width="1.5"/>' }
  }
  const add = () => {
    const cursor = document.createElement('div')
    cursor.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;transition:scale 100ms'
    document.documentElement.appendChild(cursor)
    let shape
    let point = { x: -100, y: -100 }
    const render = (name) => {
      if (name !== shape) {
        shape = name
        cursor.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24">${shapes[name].path}</svg>`
      }
      cursor.style.transform = `translate(${point.x - shapes[name].x}px,${point.y - shapes[name].y}px)`
    }
    const shapeAt = (element) => {
      const value = element instanceof Element ? getComputedStyle(element).cursor : 'auto'
      if (value === 'pointer') return 'pointer'
      return value === 'text' ? 'text' : 'default'
    }
    render('default')
    addEventListener(
      'mousemove',
      (event) => {
        point = { x: event.clientX, y: event.clientY }
        render(shapeAt(event.target))
      },
      true
    )
    addEventListener('mousedown', () => (cursor.style.scale = '0.85'), true)
    addEventListener('mouseup', () => (cursor.style.scale = '1'), true)
    setInterval(() => render(shapeAt(document.elementFromPoint(point.x, point.y))), 150)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add)
  else add()
}

const actor = (page) => {
  let position = { x: SCREEN.width / 2, y: SCREEN.height / 2 }

  const moveTo = async (x, y) => {
    const from = position
    const steps = Math.min(28, Math.max(8, Math.round(Math.hypot(x - from.x, y - from.y) / 40)))
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps
      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
      await page.mouse.move(from.x + (x - from.x) * eased, from.y + (y - from.y) * eased)
    }
    position = { x, y }
  }

  const move = async (locator) => {
    for (let attempt = 1; ; attempt++) {
      try {
        await locator.scrollIntoViewIfNeeded()
        const box = await locator.boundingBox()
        return await moveTo(box.x + box.width / 2, box.y + box.height / 2)
      } catch (error) {
        if (attempt === 3) throw error
        await page.waitForTimeout(300)
      }
    }
  }

  const click = async (locator) => {
    await move(locator)
    await page.waitForTimeout(150)
    await locator.click()
  }

  return {
    pause: (ms) => page.waitForTimeout(ms),
    moveTo,
    move,
    click,
    type: async (locator, text) => {
      await click(locator)
      await locator.pressSequentially(text, { delay: 70 })
    },
    hover: async (locators, ms = 900) => {
      for (const locator of locators) {
        await move(locator)
        await page.waitForTimeout(ms)
      }
    },
    scroll: async (distance) => {
      for (let i = 0; i < 30; i++) {
        await page.mouse.wheel(0, distance / 30)
        await page.waitForTimeout(16)
      }
    }
  }
}

const ffmpeg = (args) => {
  const child = spawn('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: ['pipe', 'inherit', 'inherit'] })
  const exited = new Promise((resolve, reject) =>
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`))))
  )
  exited.catch(() => {})
  return { child, exited }
}

const startRecording = async (file) => {
  const raw = `${file}.raw.mkv`
  const capture = ffmpeg([
    ...['-f', 'x11grab', '-framerate', '30', '-video_size', `${SCREEN.width * VIDEO_SCALE}x${SCREEN.height * VIDEO_SCALE}`, '-draw_mouse', '0'],
    ...['-i', process.env.DISPLAY, '-c:v', 'libx264rgb', '-preset', 'ultrafast', '-crf', '0', raw]
  ])
  await sleep(500)
  return async () => {
    capture.child.stdin.end('q')
    await capture.exited
    await ffmpeg([
      ...['-i', raw, '-vf', 'scale=out_color_matrix=bt709:out_range=tv:flags=lanczos+accurate_rnd+full_chroma_int'],
      ...['-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p'],
      ...['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv'],
      ...['-movflags', '+faststart', file]
    ]).exited
    rmSync(raw)
  }
}

export const recordVideo = async (name, { prepare, act }) => {
  mkdirSync(`${OUTPUT}/videos`, { recursive: true })
  rmSync(`${OUTPUT}/videos/${name}-error.png`, { force: true })
  const browser = await chromium.launch({
    headless: false,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [`--force-device-scale-factor=${VIDEO_SCALE}`, `--window-size=${SCREEN.width},${SCREEN.height}`, '--window-position=0,0', '--hide-scrollbars']
  })
  const context = await browser.newContext({ viewport: null, colorScheme: 'dark' })
  await context.addInitScript(fakeCursor)
  await setupContext(context)
  const page = await context.newPage()
  page.on('dialog', (dialog) => dialog.accept())

  try {
    const cdp = await context.newCDPSession(page)
    const { windowId } = await cdp.send('Browser.getWindowForTarget')
    await cdp.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'fullscreen' } })
    await page.waitForTimeout(4000)
    await prepare(page)
    const user = actor(page)
    await user.moveTo(SCREEN.width / 2, SCREEN.height / 2)
    const stop = await startRecording(`${OUTPUT}/videos/${name}.mp4`)
    try {
      await act(page, user)
    } finally {
      await stop()
    }
  } catch (error) {
    await page.screenshot({ path: `${OUTPUT}/videos/${name}-error.png` }).catch(() => {})
    throw error
  } finally {
    await browser.close()
  }
}
