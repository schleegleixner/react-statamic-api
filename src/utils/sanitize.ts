export const sanitizeName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')

export const sanitizeNumber = (
  value: string | number | null | undefined,
  default_value: number = NaN,
): number => {
  if (value === null || value === undefined) {
    return default_value
  }

  if (typeof value === 'number') {
    return value
  }

  const cleaned = value.trim()

  const parseOrDefault = (str: string) => {
    const parsed = parseFloat(str)
    return Number.isNaN(parsed) ? default_value : parsed
  }

  // European format: 1.234,56
  if (/^\d{1,3}(\.\d{3})*,\d+$/.test(cleaned)) {
    return parseOrDefault(cleaned.replace(/\./g, '').replace(',', '.'))
  }

  // US format: 1,234.56
  if (/^\d+(\.\d+)?$/.test(cleaned)) {
    return parseOrDefault(cleaned)
  }

  return default_value
}

export function replaceContentTags(title: string): string {
  return title.replace(/\[animate:\s*([0-9.,]+)\]/g, '$1')
}
