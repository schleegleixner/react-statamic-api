// format numbers with specified decimal digits and locale
export function numberFormat(
  value: number,
  digits: number = 0,
  locale: string = 'de-DE',
): string {
  if (typeof value !== 'number') {
    return 'NAN'
  }

  return value.toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}
