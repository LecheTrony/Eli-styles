// Genera los iconos PNG de la app (rosa + corazón blanco) usando rsvg-convert.
// Uso: npm run icons
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'icons')
const tmpDir = join(root, 'scripts', '.tmp')

mkdirSync(outDir, { recursive: true })
mkdirSync(tmpDir, { recursive: true })

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'

// heartRatio: proporción del ancho del lienzo que ocupa el corazón.
function buildSvg(heartRatio) {
  const size = 512
  const heartWidth = size * heartRatio
  const scale = heartWidth / 24
  const offset = (size - heartWidth) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff7ab0"/>
      <stop offset="0.55" stop-color="#ff4d94"/>
      <stop offset="1" stop-color="#d92e75"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    <path d="${HEART_PATH}" fill="#ffffff"/>
  </g>
</svg>`
}

const targets = [
  { name: 'apple-touch-icon.png', size: 180, heart: 0.5 },
  { name: 'icon-192.png', size: 192, heart: 0.54 },
  { name: 'icon-512.png', size: 512, heart: 0.54 },
  { name: 'icon-maskable-512.png', size: 512, heart: 0.4 },
  { name: 'favicon-32.png', size: 32, heart: 0.58 },
]

for (const target of targets) {
  const svgPath = join(tmpDir, `${target.name}.svg`)
  writeFileSync(svgPath, buildSvg(target.heart))
  execFileSync('rsvg-convert', [
    '-w',
    String(target.size),
    '-h',
    String(target.size),
    svgPath,
    '-o',
    join(outDir, target.name),
  ])
  console.log(`✓ ${target.name} (${target.size}×${target.size})`)
}

rmSync(tmpDir, { recursive: true, force: true })
console.log(`Iconos generados en ${outDir}`)
