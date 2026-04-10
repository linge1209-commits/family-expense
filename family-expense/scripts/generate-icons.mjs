import sharp from 'sharp'
import { mkdir } from 'fs/promises'

// 💰 emoji 用純色背景 + 文字 SVG 製作
const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

const svgIcon = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#2563EB"/>
  <text
    x="50%"
    y="55%"
    font-size="${size * 0.55}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif"
  >💰</text>
</svg>
`

await mkdir('public/icons', { recursive: true })

for (const size of sizes) {
  await sharp(Buffer.from(svgIcon(size)))
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`)
  console.log(`✓ icon-${size}x${size}.png`)
}

// apple-touch-icon (180x180)
await sharp(Buffer.from(svgIcon(180)))
  .png()
  .toFile('public/icons/apple-touch-icon.png')
console.log('✓ apple-touch-icon.png')

console.log('Done!')
