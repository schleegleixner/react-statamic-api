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
  default_value: any = NaN,
): number => {
  if (value === null || value === undefined) {
    return default_value
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  const str_value = String(value).trim().replace(/\./g, '').replace(',', '.')

  // check if the cleaned string is a valid number representation
  if (!/^-?\d+(\.\d+)?$/.test(str_value)) {
    return default_value
  }

  const parsed = parseFloat(str_value)
  return Number.isNaN(parsed) ? default_value : parsed
}

export function replaceContentTags(title: string): string {
  return title.replace(/\[animate:\s*([0-9.,]+)\]/g, '$1')
}
