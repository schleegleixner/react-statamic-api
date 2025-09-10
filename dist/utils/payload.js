export function filterValidEntries(data, needs_valid_data = false) {
    if (!data.length) {
        return [];
    }
    const firstColumnKey = Object.keys(data[0])[0];
    const firstKeyIsNumeric = !isNaN(Number(firstColumnKey)); // check if first key is numeric, should be year then
    if (!firstColumnKey) {
        throw new Error('Data does not contain any keys.');
    }
    return data
        .map(entry => {
        // create a new object with filtered keys
        const filtered_entry = {};
        for (const [key, value] of Object.entries(entry)) {
            if (key && !key.startsWith('_')) {
                filtered_entry[key] = value;
            }
        }
        return filtered_entry;
    })
        .filter(entry => {
        const isFirstColumnValid = (typeof entry[firstColumnKey] === 'string' &&
            entry[firstColumnKey].trim() !== '') ||
            (typeof entry[firstColumnKey] === 'number' &&
                !isNaN(Number(entry[firstColumnKey]))) ||
            firstKeyIsNumeric;
        const hasValidData = Object.entries(entry).some(([key, value]) => {
            return (key !== firstColumnKey &&
                typeof value === 'string' &&
                value.trim() !== '');
        });
        return isFirstColumnValid && (hasValidData || needs_valid_data);
    });
}
export function normalizeHeaders(data) {
    return data.map(entry => {
        const normalizedEntry = {};
        Object.keys(entry).forEach(key => {
            // normalize timescale keys
            const normalizedKey = key.toUpperCase() === 'ZEIT' || key.toUpperCase() === 'JAHR'
                ? 'INDEX'
                : key;
            normalizedEntry[normalizedKey] = entry[key];
            // remove leading and trailing whitespace from keys
            const trimmedKey = normalizedKey.trim();
            normalizedEntry[trimmedKey] = entry[key];
        });
        return normalizedEntry;
    });
}
