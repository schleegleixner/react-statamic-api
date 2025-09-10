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
