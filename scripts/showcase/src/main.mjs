import { recordVideo } from './browser.mjs'
import { startLoad } from './load.mjs'
import { takeScreenshots, SCREENSHOTS } from './screenshots.mjs'
import { seed } from './seed.mjs'
import { VIDEOS } from './videos.mjs'

const args = process.argv.slice(2)
const known = ['videos', ...Object.keys(SCREENSHOTS), ...Object.keys(VIDEOS)]
const unknown = args.filter((arg) => !known.includes(arg))
if (unknown.length) {
  console.error(`unknown target(s): ${unknown.join(', ')}. available: ${known.join(', ')}`)
  process.exit(1)
}

const wanted = (name) => args.length === 0 || args.includes(name)
const screenshotSets = Object.keys(SCREENSHOTS).filter(wanted).flatMap((name) => SCREENSHOTS[name])
const videos = Object.keys(VIDEOS).filter((name) => wanted('videos') || args.includes(name))

console.log(`> targets: ${[...Object.keys(SCREENSHOTS).filter(wanted), ...videos].join(', ')}`)
const { productionUuid } = await seed()
console.log('> starting background searches and indexing')
const stopLoad = startLoad()
const failures = []

if (screenshotSets.length) {
  console.log('> screenshots')
  await takeScreenshots(screenshotSets, productionUuid).catch((error) => failures.push(['screenshots', error]))
}

for (const name of videos) {
  console.log(`> video ${name}`)
  const started = Date.now()
  await recordVideo(name, { uuid: productionUuid, ...VIDEOS[name] })
    .then(() => console.log(`  videos/${name}.mp4 done in ${Math.round((Date.now() - started) / 1000)}s`))
    .catch((error) => failures.push([name, error]))
}

await stopLoad()
for (const [name, error] of failures) console.error(`! ${name} failed: ${error.message}`)
process.exit(failures.length ? 1 : 0)
