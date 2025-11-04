export const sanitizeName = (name?: string | null): string => {
  if (!name || typeof name !== 'string') {
    return ''
  }
  return name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
}

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

  const str_value = String(value).trim()
  const parseOrDefault = (str: string) => {
    const parsed = parseFloat(str)
    return Number.isNaN(parsed) ? default_value : parsed
  }

  // handle german number format e.g., "1.234,56"
  return parseOrDefault(str_value.replace(/\./g, '').replace(',', '.'))
}

export function replaceContentTags(title: string): string {
  return title.replace(/\[animate:\s*([0-9.,]+)\]/g, '$1')
}
