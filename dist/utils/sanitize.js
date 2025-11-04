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
    // handle different number formats
    if (/^\d{1,3}(\.\d{3})*,\d+$/.test(str_value)) {
        return parseOrDefault(str_value.replace(/\./g, '').replace(',', '.'));
    }
    if (/^\d+(\.\d+)?$/.test(str_value)) {
        return parseOrDefault(str_value);
    }
    return default_value;
};
export function replaceContentTags(title) {
    return title.replace(/\[animate:\s*([0-9.,]+)\]/g, '$1');
}
