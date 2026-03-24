/**
 * Macht den Hintergrund der Favicon-PNG transparent — nur Waldgrün-Linien bleiben sichtbar.
 * Nutzung: node scripts/favicon-transparent.mjs
 *
 * Nicht auf bereits mit remove.bg o.ä. freigestellte PNGs anwenden — die Qualität ist dann
 * meist besser ohne dieses Skript.
 */

import { Jimp } from 'jimp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
/** Hauptfarbe der Linien / Kreis (Waldgrün) */
const LINE = { r: 0x4a, g: 0x5d, b: 0x4e }
/** Pixel innerhalb dieser Distanz zu LINE gelten als Motiv (inkl. Kantenglättung). */
const LINE_THRESHOLD = 78

function colorDistance(a, b) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2)
}

async function main() {
  const pngPath = path.join(__dirname, '..', 'public', 'favicon.png')
  const image = await Jimp.read(pngPath)
  const { data, width, height } = image.bitmap
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) * 4
      const r = data[idx + 0]
      const g = data[idx + 1]
      const b = data[idx + 2]
      const dist = colorDistance({ r, g, b }, LINE)
      const isLine = dist <= LINE_THRESHOLD
      data[idx + 3] = isLine ? 255 : 0
    }
  }
  await image.write(pngPath)
  console.log('favicon.png: Hintergrund entfernt (nur dunkle Linien, transparent).')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
