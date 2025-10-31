// format numbers with specified decimal digits and locale
export function numberFormat(value, digits = 0, locale = 'de-DE') {
    if (typeof value !== 'number') {
        return 'NAN';
    }
    return value.toLocaleString(locale, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
}
