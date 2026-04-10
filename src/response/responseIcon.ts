import React from 'react'

const DEFAULT_SIZE = 320
const DEFAULT_BG = '#37444d'
const DEFAULT_ICON_COLOR = '#ffffff'

type IconComponent = (props: Record<string, unknown>) => React.ReactElement

function normalizeColor(value: string): string {
  if (/^[0-9a-fA-F]{3,8}$/.test(value)) {
    return `#${value}`
  }
  return value
}

/**
 * Route-handler helper that renders an SVG icon component to a PNG image.
 *
 * Query parameters:
 *  - `size`  – image dimensions in px (default 320, clamped 16–1024)
 *  - `bg`    – background hex colour (default `#37444d`)
 *  - `color` – icon hex colour (default `#ffffff`)
 *
 * @param id       Icon key used to look up the component in `iconMap`.
 * @param req      Incoming request (used to read query parameters).
 * @param sharp    The `sharp` module (passed as peer dependency).
 * @param iconMap  Map of icon keys → React SVG components.
 * @param fallback Optional fallback component when `id` is not found.
 */
export default async function responseIcon(
  id: string,
  req: Request,
  sharp: any,
  iconMap: Record<string, IconComponent>,
  fallback?: IconComponent,
): Promise<Response> {
  const { searchParams } = new URL(req.url)

  const size = Math.min(
    Math.max(parseInt(searchParams.get('size') || String(DEFAULT_SIZE)), 16),
    1024,
  )
  const bg = normalizeColor(searchParams.get('bg') || DEFAULT_BG)
  const color = normalizeColor(
    searchParams.get('color') || DEFAULT_ICON_COLOR,
  )

  const Icon = iconMap[id] ?? fallback
  if (!Icon) {
    return new Response(null, { status: 404 })
  }

  const { renderToStaticMarkup } = await import('react-dom/server')

  const iconMarkup: string = renderToStaticMarkup(
    Icon({ fill: color, stroke: color, style: { color } }),
  )

  const coloredMarkup = iconMarkup.replace(/currentColor/g, color)

  const viewBoxMatch = coloredMarkup.match(/viewBox="([^"]*)"/)
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 50 50'

  const innerContent = coloredMarkup
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>$/, '')

  const padding = size * 0.1
  const iconSize = size - padding * 2

  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${bg}"/>
  <svg x="${padding}" y="${padding}" width="${iconSize}" height="${iconSize}" viewBox="${viewBox}" fill="${color}" stroke="${color}">
    ${innerContent}
  </svg>
</svg>`

  const png: Buffer = await sharp(Buffer.from(fullSvg))
    .resize(size, size)
    .png()
    .toBuffer()

  return new Response(new Uint8Array(png), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
