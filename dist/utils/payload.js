import { castValue } from './convert';
export function getValue(tile_payload, key, fallback = null, attribute) {
    var _a;
    const value = ((_a = tile_payload[attribute]) === null || _a === void 0 ? void 0 : _a.find((val) => val.id === key)) || null;
    if (value) {
        return castValue(value.val);
    }
    return fallback;
}
export function getValues(tile_payload, defaults = {}, attribute) {
    var _a;
    const values = (_a = tile_payload[attribute]) !== null && _a !== void 0 ? _a : {};
    const casted = Object.fromEntries(Object.entries(values).map(([key, val]) => [key, castValue(val)]));
    return Object.assign(Object.assign({}, defaults), casted);
}
export function getDataPoint(tile_payload, key, fallback = null) {
    const result = getValue(tile_payload, key, fallback, 'datapoints');
    return result;
}
export function getDatapoints(tile_payload, defaults = {}) {
    const result = getValues(tile_payload, defaults, 'datapoints');
    return result;
}
export function getSetting(tile_payload, key, fallback = null) {
    const result = getValue(tile_payload, key, fallback, 'settings');
    return result;
}
export function getSettings(tile_payload, defaults = {}) {
    const result = getValues(tile_payload, defaults, 'settings');
    return result;
}
export function getString(tile_payload, key, fallback = '') {
    const result = getValue(tile_payload, key, fallback, 'strings');
    return result;
}
export function getStrings(tile_payload, defaults = {}) {
    const result = getValues(tile_payload, defaults, 'strings');
    return result;
}
export function getDataSource(tile_payload, find = true) {
    var _a, _b;
    const datasources = tile_payload.datasources;
    if (!Array.isArray(datasources) || datasources.length === 0) {
        return null;
    }
    // get first datasource if find is true
    if (find === true) {
        return (_a = datasources[0]) !== null && _a !== void 0 ? _a : null;
    }
    if (typeof find === 'number') {
        return (_b = datasources[find]) !== null && _b !== void 0 ? _b : null;
    }
    if (typeof find === 'string') {
        const found = datasources.find(entry => entry.file_name === find);
        return found !== null && found !== void 0 ? found : null;
    }
    return null;
}
export function getDataSourceContent(tile_payload, find = true, fallback = null) {
    var _a, _b;
    return (_b = (_a = getDataSource(tile_payload, find)) === null || _a === void 0 ? void 0 : _a.content) !== null && _b !== void 0 ? _b : fallback;
}
