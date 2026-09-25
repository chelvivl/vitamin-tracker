/**
 * Minimal PNG writer (RGBA, no deps) — generates PWA icons.
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public')

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type)
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  const crc = crc32(Buffer.concat([typeBuf, data]))
  crcBuf.writeUInt32BE(crc)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function createPng(size, paint) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1)
    raw[row] = 0
    for (let x = 0; x < size; x++) {
      const [r, g, b, a = 255] = paint(x, y, size)
      const i = row + 1 + x * 4
      raw[i] = r
      raw[i + 1] = g
      raw[i + 2] = b
      raw[i + 3] = a
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function iconPaint(x, y, size) {
  const n = size
  const cx = (x + 0.5) / n
  const cy = (y + 0.5) / n
  const radius = 0.22
  const dx = Math.max(Math.abs(cx - 0.5) - (0.5 - radius), 0)
  const dy = Math.max(Math.abs(cy - 0.5) - (0.5 - radius), 0)
  const outside = dx * dx + dy * dy > radius * radius
  if (outside) return [0, 0, 0, 0]

  // soft green rounded square
  const base = [47, 107, 79, 255]

  // capsule highlight
  const px = (cx - 0.5) * 2
  const py = (cy - 0.42) * 2.2
  const inCapsule = px * px * 0.55 + py * py < 0.22
  if (inCapsule) return [232, 245, 238, 255]

  // small center dot
  const dx2 = cx - 0.5
  const dy2 = cy - 0.4
  if (dx2 * dx2 + dy2 * dy2 < 0.012) return [47, 107, 79, 255]

  // stem
  if (Math.abs(cx - 0.5) < 0.06 && cy > 0.55 && cy < 0.78) return [183, 217, 196, 255]

  return base
}

for (const size of [180, 192, 512]) {
  const name = size === 180 ? 'apple-touch-icon.png' : `pwa-${size}x${size}.png`
  writeFileSync(join(outDir, name), createPng(size, iconPaint))
  console.log('wrote', name)
}
