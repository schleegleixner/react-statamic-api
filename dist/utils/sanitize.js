export const sanitizeName = (name) => {
    if (!name || typeof name !== 'string') {
        return '';
    }
    return name
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');
};
export const sanitizeNumber = (value, default_value = NaN) => {
    if (value === null || value === undefined) {
        return default_value;
    }
    if (typeof value === 'number') {
        return value;
    }
    const str_value = String(value).trim();
    const parseOrDefault = (str) => {
        const parsed = parseFloat(str);
        return Number.isNaN(parsed) ? default_value : parsed;
    };
    // handle german number format e.g., "1.234,56"
    return parseOrDefault(str_value.replace(/\./g, '').replace(',', '.'));
};
export function replaceContentTags(title) {
    return title.replace(/\[animate:\s*([0-9.,]+)\]/g, '$1');
}
