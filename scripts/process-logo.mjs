/**
 * Ersetzt in der Logo-PNG alle Nicht-Grün-Pixel durch den Seitenhintergrund (#FCFAF7).
 * Nur Pixel, die nah an Waldgrün (#4A5D4E) sind, bleiben erhalten.
 *
 * Nutzung: node scripts/process-logo.mjs
 * Voraussetzung: src/assets/harvested-symbol.png muss existieren.
 */

import Jimp from 'jimp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GREEN = { r: 0x4a, g: 0x5d, b: 0x4e }
const BG = { r: 0xfc, g: 0xfa, b: 0xf7 }
const THRESHOLD = 55 // maximale RGB-Distanz, damit ein Pixel als "grün" zählt

function colorDistance(a, b) {
  return Math.sqrt(
    (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2
  )
}

async function main() {
  const inputPath = path.join(__dirname, '..', 'public', 'harvested-logo.png')
  const fs = await import('fs')
  if (!fs.existsSync(inputPath)) {
    console.error('Logo-Datei fehlt: Leg dein echtes Logo als public/harvested-logo.png ab, dann erneut ausführen.')
    process.exit(1)
  }
  const image = await Jimp.read(inputPath)
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
    const r = image.bitmap.data[idx + 0]
    const g = image.bitmap.data[idx + 1]
    const b = image.bitmap.data[idx + 2]
    const a = image.bitmap.data[idx + 3]
    const dist = colorDistance({ r, g, b }, GREEN)
    const isGreen = dist <= THRESHOLD
    if (!isGreen) {
      image.bitmap.data[idx + 0] = BG.r
      image.bitmap.data[idx + 1] = BG.g
      image.bitmap.data[idx + 2] = BG.b
      image.bitmap.data[idx + 3] = a
    }
  })
  await image.write(inputPath)
  console.log('Logo verarbeitet: Nicht-Grün-Pixel auf #FCFAF7 gesetzt.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
