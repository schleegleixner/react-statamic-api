import { getDataSource } from '../utils/payload';
import { sanitizeNumber } from './sanitize';
function checkValue(value, multiplier = 1) {
    const sanitized = sanitizeNumber(value);
    if (isNaN(sanitized)) {
        return null;
    }
    return sanitized * multiplier;
}
function countDecimals(value) {
    var _a;
    return Math.floor(value) === value
        ? 0
        : ((_a = value.toString().split('.')[1]) === null || _a === void 0 ? void 0 : _a.length) || 0;
}
function getMaxDecimals(values) {
    return values.length > 0 ? Math.max(...values.map(countDecimals)) : 0;
}
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
export function getCompiledDatasource(tile_payload, datasource_id) {
    var _a;
    const datasource = getDataSource(tile_payload, datasource_id);
    if (!((_a = datasource === null || datasource === void 0 ? void 0 : datasource.content) === null || _a === void 0 ? void 0 : _a.length)) {
        return null;
    }
    const cloned_datasource = JSON.parse(JSON.stringify(datasource));
    cloned_datasource.content = cloned_datasource.content
        .map((row) => {
        var _a;
        let is_valid = false;
        const new_row = { INDEX: row.INDEX };
        // process all table rows
        (_a = cloned_datasource.table_rows) === null || _a === void 0 ? void 0 : _a.forEach((table_row) => {
            var _a;
            const keys = table_row.key.split(';').map(k => k.trim());
            const multiplier = (_a = table_row.multiplier) !== null && _a !== void 0 ? _a : 1;
            let value = null;
            // sum up all keys
            keys.forEach(key => {
                key = key.replace(/[€%‰]/g, '?'); // replace invalid characters with ?
                const is_negative = key.startsWith('-');
                const effective_key = is_negative ? key.slice(1) : key;
                const effective_multiplier = is_negative ? -multiplier : multiplier;
                const original_value = row[effective_key];
                const checked_value = checkValue(original_value, effective_multiplier);
                if (checked_value !== null) {
                    value = (value !== null && value !== void 0 ? value : 0) + checked_value;
                }
            });
            // assign the value if valid
            if (value != null) {
                new_row[table_row.key] =
                    typeof table_row.decimals === 'number'
                        ? parseFloat(value.toFixed(table_row.decimals))
                        : value;
                is_valid = true;
            }
        });
        // only return the row if at least one value is valid
        return is_valid ? new_row : null;
    })
        .filter(row => row !== null);
    cloned_datasource.year_min = Math.min(...cloned_datasource.content.map((d) => d.INDEX));
    cloned_datasource.year_max = Math.max(...cloned_datasource.content.map((d) => d.INDEX));
    return cloned_datasource.content.length ? cloned_datasource : null;
}
export function getRows(datasource, yearIndex) {
    var _a, _b, _c;
    const rows = (_a = datasource.table_rows) !== null && _a !== void 0 ? _a : [];
    yearIndex = yearIndex !== null && yearIndex !== void 0 ? yearIndex : datasource.entry_count;
    if (!(rows === null || rows === void 0 ? void 0 : rows.length) || !datasource) {
        return {
            rows: {},
            row_count: 0,
        };
    }
    const current = (_b = datasource.content[yearIndex]) !== null && _b !== void 0 ? _b : null;
    const previous = typeof yearIndex === 'number' && yearIndex > 0
        ? ((_c = datasource.content[yearIndex - 1]) !== null && _c !== void 0 ? _c : null)
        : null;
    if (!current || typeof current !== 'object') {
        return {
            rows: {},
            row_count: 0,
        };
    }
    const new_values = {};
    rows.forEach(row => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const current_value = current[row.key];
        const previous_value = previous && row.key in previous ? ((_a = previous[row.key]) !== null && _a !== void 0 ? _a : null) : null;
        // collect all values for the keys
        const all_values = datasource.content
            .map((item) => checkValue(item[row.key]))
            .filter((v) => v !== null);
        // get the maximum number of decimals
        const decimals = (_b = row.decimals) !== null && _b !== void 0 ? _b : getMaxDecimals(all_values);
        new_values[row.key] = {
            current: current_value,
            previous: previous_value,
            label: (_c = row.label) !== null && _c !== void 0 ? _c : row.key,
            unit: (_d = row.unit) !== null && _d !== void 0 ? _d : null,
            icon: (_e = row.icon) !== null && _e !== void 0 ? _e : null,
            variant: (_f = row.variant) !== null && _f !== void 0 ? _f : null,
            decimals,
            divider: (_g = row.divider) !== null && _g !== void 0 ? _g : true,
            hide_trend: (_h = row.hide_trend) !== null && _h !== void 0 ? _h : false,
        };
    });
    return {
        rows: new_values,
        row_count: Object.keys(new_values).length,
    };
}
export function getDatasetByKey(datasource, key) {
    return [...datasource.content]
        .sort((a, b) => { var _a, _b; return +((_a = a.INDEX) !== null && _a !== void 0 ? _a : 0) - +((_b = b.INDEX) !== null && _b !== void 0 ? _b : 0); })
        .map(r => Number(r[key]) || 0);
}
export function getDatasetByIndex(datasource, needle_index) {
    var _a;
    const index_str = String(needle_index);
    return ((_a = datasource.content.find((row) => String(row.INDEX) === index_str)) !== null && _a !== void 0 ? _a : null);
}
