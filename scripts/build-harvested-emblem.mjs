/**
 * Baut `public/favicon.png` aus `scripts/assets/harvested-emblem-source.png`:
 * - hellen Hintergrund entfernen
 * - Wortmarke unter dem Kreis abschneiden
 * - quadratisch zentrieren
 * - rechte Hälfte = Spiegelung der linken (symmetrische Ornamente)
 * - Ausgabe 512×512 für Tab + Login
 *
 * Nutzung: node scripts/build-harvested-emblem.mjs
 */

import { Jimp } from 'jimp'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const SOURCE = path.join(__dirname, 'assets', 'harvested-emblem-source.png')
const OUT = path.join(root, 'public', 'favicon.png')

function removeNearWhite(img) {
  const { data } = img.bitmap
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (r > 242 && g > 242 && b > 242) {
      data[i + 3] = 0
    }
  }
}

function rowOpaqueCounts(img) {
  const { data, width, height } = img.bitmap
  const counts = new Array(height).fill(0)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (x + y * width) * 4
      if (data[idx + 3] > 25) counts[y]++
    }
  }
  return counts
}

/**
 * Erste Zeile der Wortmarke: deutlich mehr horizontale Deckung als im Kreis-Emblem.
 * (Schmale Kreiszeilen bleiben unter ~50 % der max. Zeilendichte.)
 */
function findEmblemBottomY(img) {
  const { height } = img.bitmap
  const counts = rowOpaqueCounts(img)
  const maxC = Math.max(...counts, 1)
  const textBand = maxC * 0.55
  const minY = Math.floor(height * 0.32)
  for (let y = minY; y < height; y++) {
    if (counts[y] >= textBand) {
      return Math.max(8, y - 6)
    }
  }
  return Math.floor(height * 0.52)
}

function contentBounds(img) {
  const { data, width, height } = img.bitmap
  let minX = width
  let minY = height
  let maxX = 0
  let maxY = 0
  let any = false
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (x + y * width) * 4
      if (data[idx + 3] > 25) {
        any = true
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (!any) return null
  return { minX, minY, maxX, maxY }
}

/** Rechte Bildhälfte = horizontale Spiegelung der linken (symmetrisches Ornament). */
function mirrorLeftToRight(img) {
  const { data, width, height } = img.bitmap
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < Math.floor(width / 2); x++) {
      const srcIdx = (x + y * width) * 4
      const xr = width - 1 - x
      const dstIdx = (xr + y * width) * 4
      data[dstIdx] = data[srcIdx]
      data[dstIdx + 1] = data[srcIdx + 1]
      data[dstIdx + 2] = data[srcIdx + 2]
      data[dstIdx + 3] = data[srcIdx + 3]
    }
  }
}

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error('Fehlt:', SOURCE)
    process.exit(1)
  }

  let img = await Jimp.read(SOURCE)
  removeNearWhite(img)

  const splitY = findEmblemBottomY(img)
  await img.crop({ x: 0, y: 0, w: img.bitmap.width, h: splitY })

  const b = contentBounds(img)
  if (!b) {
    console.error('Kein sichtbarer Inhalt nach Zuschnitt.')
    process.exit(1)
  }

  const pad = 6
  let cw = b.maxX - b.minX + 1 + pad * 2
  let ch = b.maxY - b.minY + 1 + pad * 2
  await img.crop({
    x: Math.max(0, b.minX - pad),
    y: Math.max(0, b.minY - pad),
    w: Math.min(img.bitmap.width - Math.max(0, b.minX - pad), cw),
    h: Math.min(img.bitmap.height - Math.max(0, b.minY - pad), ch),
  })

  const bb = contentBounds(img)
  if (!bb) process.exit(1)
  const side = Math.max(bb.maxX - bb.minX + 1, bb.maxY - bb.minY + 1) + pad * 2

  const w0 = img.bitmap.width
  const h0 = img.bitmap.height
  const canvas = new Jimp({ width: side, height: side, color: 0x00000000 })
  const ox = Math.floor((side - w0) / 2)
  const oy = Math.floor((side - h0) / 2)
  await canvas.blit({ src: img, x: ox, y: oy })

  mirrorLeftToRight(canvas)

  await canvas.resize({ w: 512, h: 512 })
  await canvas.write(OUT)

  console.log('Geschrieben:', OUT, '(512×512, Emblem ohne Text, gespiegelt symmetrisch)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
