// parseTooltipParams parses the tooltip params and returns the tooltip data
export const parseTooltipParams = (params, indices) => {
    var _a, _b, _c;
    // Dedupe by seriesName, prefer items with actual values
    const seen_names = new Map();
    for (const item of params) {
        const existing = seen_names.get(item.seriesName);
        if (!existing) {
            seen_names.set(item.seriesName, item);
            continue;
        }
        // Prefer the item with an actual value over null
        const has_value = item.value !== null && item.value !== undefined;
        const existing_has_value = existing.value !== null && existing.value !== undefined;
        if (has_value && !existing_has_value) {
            seen_names.set(item.seriesName, item);
        }
    }
    const unique_params = Array.from(seen_names.values());
    let timestamp = '';
    let year = '';
    const series_data = [];
    const seen = new Set();
    for (const series of unique_params) {
        const series_name = series.seriesName;
        if (series.value === null ||
            series.value === undefined ||
            seen.has(series_name) ||
            series_name.toLowerCase() === 'trend' ||
            series_name.toLowerCase() === 'trendline') {
            continue;
        }
        if (seen.size === 0) {
            timestamp = year = (_a = series.axisValue) !== null && _a !== void 0 ? _a : series.value[0];
            year = timestamp;
            if (typeof year === 'number' && year > 3000) {
                if (year > 10000000000) {
                    year = new Date(year).getFullYear();
                }
                else {
                    year = new Date(year * 1000).getFullYear();
                }
            }
        }
        seen.add(series_name);
        const value = Array.isArray(series.value) && series.value.length > 1
            ? series.value[1].toLocaleString('de-DE')
            : series.value.toLocaleString('de-DE');
        const unit = (_c = (_b = Object.values(indices).find(i => i.title === series_name)) === null || _b === void 0 ? void 0 : _b.unit) !== null && _c !== void 0 ? _c : '';
        series_data.push({
            label: series_name,
            value,
            unit,
            marker: series.marker,
        });
    }
    if (series_data.length === 0) {
        return null;
    }
    return {
        timestamp,
        year,
        series: series_data,
    };
};
