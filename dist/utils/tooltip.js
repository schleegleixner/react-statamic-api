// parseTooltipParams parses the tooltip params and returns the tooltip data
export const parseTooltipParams = (params, indices) => {
    var _a, _b, _c;
    const seen = new Set();
    // filter duplicates by seriesName
    const uniqueParams = params.filter((item, index, self) => index ===
        self.findIndex((obj) => obj.seriesName === item.seriesName));
    let year = '';
    const seriesData = [];
    for (const series of uniqueParams) {
        const seriesName = series.seriesName;
        if (series.value === null ||
            series.value === undefined ||
            seen.has(seriesName) ||
            seriesName.toLowerCase() === 'trend' ||
            seriesName.toLowerCase() === 'trendline') {
            continue;
        }
        // extract year only once
        if (seen.size === 0) {
            year = (_a = series.axisValue) !== null && _a !== void 0 ? _a : new Date(series.value[0]).getFullYear();
        }
        seen.add(seriesName);
        const value = Array.isArray(series.value) && series.value.length > 1
            ? series.value[1].toLocaleString('de-DE')
            : series.value.toLocaleString('de-DE');
        const unit = (_c = (_b = Object.values(indices).find(i => i.title === seriesName)) === null || _b === void 0 ? void 0 : _b.unit) !== null && _c !== void 0 ? _c : '';
        seriesData.push({
            label: seriesName,
            value,
            unit,
            marker: series.marker,
        });
    }
    if (seriesData.length === 0) {
        return null;
    }
    return {
        year,
        series: seriesData,
    };
};
