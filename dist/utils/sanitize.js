export const sanitizeName = (name) => {
    if (!name || typeof name !== 'string') {
        return '';
    }
    return name
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');
};
export function sanitizeString(str) {
    if (typeof str !== 'string') {
        return str;
    }
    return str
        .normalize('NFKD') // fix (é -> e)
        .replace(/[^\x00-\x7F]/g, '?') // replace everything non-ascii with ?
        .replace(/[\uFFFD]/g, '?') // replace invalid characters with ?
        .replace(/[€%‰]/g, '?') // replace euro and percent/permille signs with ?
        .trim();
}
export const sanitizeNumber = (value, default_value = NaN) => {
    if (value === null || value === undefined) {
        return default_value;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    const str_value = String(value)
        .replace(/[%‰]/g, '')
        .trim()
        .replace(/\./g, '')
        .replace(',', '.');
    // check if the cleaned string is a valid number representation
    if (!/^-?\d+(\.\d+)?$/.test(str_value)) {
        return default_value;
    }
    const parsed = parseFloat(str_value);
    return Number.isNaN(parsed) ? default_value : parsed;
};
export function replaceContentTags(title) {
    return title.replace(/\[animate:\s*([0-9.,]+)\]/g, '$1');
}
