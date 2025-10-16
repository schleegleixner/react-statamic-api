export function getDataPoint(tile_payload, key, fallback = 0) {
    var _a;
    const datapoint = ((_a = tile_payload.datapoints) === null || _a === void 0 ? void 0 : _a.find((datapoint) => datapoint.id === key)) || null;
    if (datapoint) {
        return datapoint.val;
    }
    return fallback;
}
export function getString(tile_payload, key, fallback = '') {
    var _a;
    const string = ((_a = tile_payload.strings) === null || _a === void 0 ? void 0 : _a.find(string => string.id === key)) || null;
    if (string) {
        return string.val;
    }
    return fallback;
}
export function getAllStrings(tile_payload) {
    var _a;
    return (((_a = tile_payload.strings) === null || _a === void 0 ? void 0 : _a.reduce((result, item) => {
        if (item.id && item.val) {
            result[item.id] = item.val;
        }
        return result;
    }, {})) || {});
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
export function getSource(tile_payload, find = true, fallback = null) {
    var _a, _b, _c, _d;
    const datasources = tile_payload.datasources;
    if (!Array.isArray(datasources) || datasources.length === 0) {
        return fallback;
    }
    // get first datasource if find is true
    if (find === true) {
        return (_b = (_a = datasources[0]) === null || _a === void 0 ? void 0 : _a.content) !== null && _b !== void 0 ? _b : fallback;
    }
    if (typeof find === 'number') {
        return (_d = (_c = datasources[find]) === null || _c === void 0 ? void 0 : _c.content) !== null && _d !== void 0 ? _d : fallback;
    }
    if (typeof find === 'string') {
        const found = datasources.find(entry => entry.file_name === find);
        return found ? found.content : fallback;
    }
    return fallback;
}
