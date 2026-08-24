#!/usr/bin/env node
/**
 * Regenerates every derived image in `img/` from the originals in `img/_src/`.
 *
 * Drop a full-resolution JPG/PNG into `img/_src/members/<name>.jpg` (or
 * `img/_src/<name>.jpg` for a background) and run `npm run images`. Sources are
 * never shipped — Vite only bundles what `index.html` and `style.css` reference.
 */
import { mkdir, readdir, stat } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import sharp from 'sharp'

const SRC = 'originals'
const OUT = 'public/img'

/** Square member portraits, served at 320 CSS px (so 320/640 covers 1x/2x). */
const MEMBER_WIDTHS = [320, 640]
/** Full-bleed backgrounds. Widths chosen to cover phone -> 2x desktop. */
const BACKGROUND_WIDTHS = [768, 1280, 1920]

/**
 * Square crops have no face detection behind them, so each portrait names the
 * gravity that actually keeps the player's head in frame. `attention` (entropy
 * based) is the default for any photo not listed here — check a new one with
 * `npm run images` before trusting it.
 */
const CROP = {
  ed: 'attention',
  gerald: 'top',
  ken: 'centre',
  alan: 'attention',
  mischelle: 'top',
}

const AVIF = { quality: 55, effort: 6 }
const WEBP = { quality: 78, effort: 6 }
/** Backgrounds sit under a heavy scrim, so detail below this is invisible. */
const BACKGROUND_AVIF = { quality: 40, effort: 6 }
const BACKGROUND_WEBP = { quality: 60, effort: 6 }

async function exists(p) {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

async function emit(pipeline, outBase, width, [avifOpts, webpOpts] = [AVIF, WEBP]) {
  const results = []
  for (const [ext, opts, fn] of [
    ['avif', avifOpts, 'avif'],
    ['webp', webpOpts, 'webp'],
  ]) {
    const out = `${outBase}-${width}.${ext}`
    const { size } = await pipeline.clone()[fn](opts).toFile(out)
    results.push(`${basename(out)} ${(size / 1024).toFixed(1)}kB`)
  }
  return results
}

/** True when every pixel's channels match, i.e. the image is already B&W. */
async function isGrayscale(file) {
  const { channels, isGreyscale } = await sharp(file).stats()
  if (isGreyscale) return true
  const [r, g, b] = channels
  if (!b) return true
  return Math.abs(r.mean - g.mean) < 1 && Math.abs(g.mean - b.mean) < 1
}

async function processMember(file) {
  const name = basename(file, extname(file))
  const outBase = join(OUT, 'members', name)
  for (const width of MEMBER_WIDTHS) {
    const gravity = CROP[name] ?? 'attention'
    const pipeline = sharp(file).resize(width, width, {
      fit: 'cover',
      position: gravity === 'attention' ? sharp.strategy.attention : gravity,
    })
    console.log(`  ${(await emit(pipeline, outBase, width)).join('  ')}`)
  }
}

async function processBackground(file) {
  const name = basename(file, extname(file))
  const outBase = join(OUT, name)
  const { width: srcWidth } = await sharp(file).metadata()
  // The hero is a 1960s press photo with no colour in it at all. Dropping the
  // chroma planes is free on screen and roughly halves the encoded size.
  const monochrome = await isGrayscale(file)
  // Cap the ladder at the source width so a smaller original still gets one
  // full-resolution variant instead of only the rungs below it.
  const widths = [...new Set(BACKGROUND_WIDTHS.map((w) => Math.min(w, srcWidth)))]
  for (const width of widths) {
    let pipeline = sharp(file).resize(width, null, { withoutEnlargement: true })
    if (monochrome) pipeline = pipeline.grayscale()
    const opts = [BACKGROUND_AVIF, BACKGROUND_WEBP]
    console.log(`  ${(await emit(pipeline, outBase, width, opts)).join('  ')}`)
  }
}

/** 1200x630 social card: the logo centred on the brand background. */
async function buildOgImage() {
  const logo = await sharp('public/img/monkee-business-logo.svg', { density: 300 })
    .resize(1000, null, { fit: 'inside' })
    .png()
    .toBuffer()
  const { size } = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 26, g: 27, b: 29, alpha: 1 },
    },
  })
    .composite([{ input: logo, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile('public/og-image.png')
  console.log(`  og-image.png ${(size / 1024).toFixed(1)}kB`)
}

async function collect(dir) {
  if (!(await exists(dir))) return []
  const entries = await readdir(dir, { withFileTypes: true })
  return entries
    .filter((e) => e.isFile() && /\.(jpe?g|png|tiff?|webp|avif)$/i.test(e.name))
    .map((e) => join(dir, e.name))
}

const members = await collect(join(SRC, 'members'))
const backgrounds = await collect(SRC)

if (!members.length && !backgrounds.length) {
  console.error(`No sources found. Put originals in ${SRC}/ or ${SRC}/members/.`)
  process.exit(1)
}

await mkdir(join(OUT, 'members'), { recursive: true })
await mkdir('public', { recursive: true })

for (const file of members) {
  console.log(`members/${basename(file)}`)
  await processMember(file)
}
for (const file of backgrounds) {
  console.log(basename(file))
  await processBackground(file)
}
console.log('og-image')
await buildOgImage()

console.log('\nDone.')
