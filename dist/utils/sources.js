import { sanitizeLocalizedValue } from '../utils/sanitize';
export function getTimeline(data, key = 'INDEX') {
    var _a;
    if (!data || data.length === 0) {
        return [];
    }
    // normalize the key to be case-insensitive
    const normalizedKey = key.toLowerCase();
    return ((_a = data
        .map(e => {
        const matchedKey = Object.keys(e).find(k => k.toLowerCase() === normalizedKey);
        return matchedKey ? e[matchedKey] : undefined;
    })
        .filter((year) => year !== undefined)) !== null && _a !== void 0 ? _a : []);
}
function checkValue(value, multiplier = 1) {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    return sanitizeLocalizedValue(value) * multiplier;
}
export function getReducedValue(values, keys) {
    return Object.keys(values)
        .filter(key => keys.includes(key))
        .reduce((acc, key) => {
        var _a, _b, _c;
        acc.current += (_a = values[key].current) !== null && _a !== void 0 ? _a : 0;
        if (((_b = values[key]) === null || _b === void 0 ? void 0 : _b.previous) === null) {
            acc.previous = null;
        }
        else if (acc.previous !== null) {
            acc.previous += (_c = values[key].previous) !== null && _c !== void 0 ? _c : 0;
        }
        return acc;
    }, { current: 0, previous: 0 });
}
export function countDecimals(value) {
    var _a;
    return Math.floor(value) === value
        ? 0
        : ((_a = value.toString().split('.')[1]) === null || _a === void 0 ? void 0 : _a.length) || 0;
}
function getMaxDecimals(values) {
    return values.length > 0 ? Math.max(...values.map(countDecimals)) : 0;
}
export function getDatasetByKey(datasource, key) {
    return [...datasource.content]
        .sort((a, b) => +a.INDEX - +b.INDEX)
        .map(r => Number(r[key]) || 0);
}
export function getDatasetByIndex(datasource, needle_index) {
    var _a;
    const index_str = String(needle_index);
    return (_a = datasource.content.find(row => String(row.INDEX) === index_str)) !== null && _a !== void 0 ? _a : null;
}
export function getRows(datasource, yearIndex) {
    var _a, _b, _c;
    const rows = (_a = datasource.table_rows) !== null && _a !== void 0 ? _a : [];
    yearIndex = yearIndex !== null && yearIndex !== void 0 ? yearIndex : datasource.entry_count;
    if (!(rows === null || rows === void 0 ? void 0 : rows.length) || !datasource) {
        return {};
    }
    const current = (_b = datasource.content[yearIndex]) !== null && _b !== void 0 ? _b : null;
    const previous = yearIndex > 0 ? ((_c = datasource.content[yearIndex - 1]) !== null && _c !== void 0 ? _c : null) : null;
    if (!current || typeof current !== 'object') {
        return {};
    }
    const newValues = {};
    rows.forEach(row => {
        var _a, _b, _c, _d, _e, _f, _g;
        const keys = row.key.split(';').map(key => key.trim());
        const multiplier = (_a = row.multiplier) !== null && _a !== void 0 ? _a : 1;
        let aggregatedCurrent = null;
        let aggregatedPrevious = null;
        // collect all values for the keys
        const all_values = keys.flatMap(key => {
            const effectiveKey = key.startsWith('-') ? key.slice(1) : key;
            return datasource.content
                .map(item => checkValue(item[effectiveKey], multiplier))
                .filter((v) => v !== null);
        });
        // get the maximum number of decimals
        const decimals = (_b = row.decimals) !== null && _b !== void 0 ? _b : getMaxDecimals(all_values);
        // iterate over all keys
        keys.forEach(key => {
            const isNegative = key.startsWith('-');
            const effectiveKey = isNegative ? key.slice(1) : key;
            const effectiveMultiplier = isNegative ? -multiplier : multiplier;
            const currentValue = current && effectiveKey in current
                ? checkValue(current[effectiveKey], effectiveMultiplier)
                : null;
            if (currentValue !== null) {
                aggregatedCurrent = (aggregatedCurrent !== null && aggregatedCurrent !== void 0 ? aggregatedCurrent : 0) + currentValue;
            }
            const previousValue = previous && effectiveKey in previous
                ? checkValue(previous[effectiveKey], effectiveMultiplier)
                : null;
            if (previousValue !== null) {
                aggregatedPrevious = (aggregatedPrevious !== null && aggregatedPrevious !== void 0 ? aggregatedPrevious : 0) + previousValue;
            }
        });
        // Füge berechnete Werte hinzu
        newValues[row.key] = {
            current: aggregatedCurrent,
            previous: aggregatedPrevious,
            label: (_c = row.label) !== null && _c !== void 0 ? _c : row.key,
            unit: (_d = row.unit) !== null && _d !== void 0 ? _d : null,
            icon: (_e = row.icon) !== null && _e !== void 0 ? _e : null,
            variant: (_f = row.variant) !== null && _f !== void 0 ? _f : null,
            decimals,
            divider: (_g = row.divider) !== null && _g !== void 0 ? _g : true,
        };
    });
    return newValues;
}
