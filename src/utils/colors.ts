function isValidHexColor(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)
}

function hexToRgb(hex: string): [number, number, number] | null {
  if (!isValidHexColor(hex)) {
    return null
  }
  const parsed = parseInt(hex.slice(1), 16)
  const r = Math.floor((parsed >> 16) & 255)
  const g = Math.floor((parsed >> 8) & 255)
  const b = Math.floor(parsed & 255)
  return [r, g, b]
}

export function darkenHexColor(hex: string, factor: number): string {
  let [r, g, b] = hexToRgb(hex) || [0, 0, 0]
  r = Math.floor(r * factor)
  g = Math.floor(g * factor)
  b = Math.floor(b * factor)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
