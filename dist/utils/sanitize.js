export const sanitizeName = (name) => name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
export const sanitizeNumber = (value, default_value = NaN) => {
    if (value === null || value === undefined) {
        return default_value;
    }
    if (typeof value === 'number') {
        return value;
    }
    const cleaned = value.trim();
    const parseOrDefault = (str) => {
        const parsed = parseFloat(str);
        return Number.isNaN(parsed) ? default_value : parsed;
    };
    // European format: 1.234,56
    if (/^\d{1,3}(\.\d{3})*,\d+$/.test(cleaned)) {
        return parseOrDefault(cleaned.replace(/\./g, '').replace(',', '.'));
    }
    // US format: 1,234.56
    if (/^\d+(\.\d+)?$/.test(cleaned)) {
        return parseOrDefault(cleaned);
    }
    return default_value;
};
export function replaceContentTags(title) {
    return title.replace(/\[animate:\s*([0-9.,]+)\]/g, '$1');
}
