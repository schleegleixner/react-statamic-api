// getSplitSeries splits the data into past/present and future series (only linechart)
export const getSplitSeries = (data, property, split_future = true, current_year = null) => {
    const aggregated_data = {};
    data.forEach(item => {
        var _a;
        const year = (_a = item.INDEX) === null || _a === void 0 ? void 0 : _a.toString();
        const value = item[property];
        if (!year ||
            isNaN(+year) ||
            year.length !== 4 ||
            +year < 1800 ||
            +year > 2100) {
            return;
        }
        aggregated_data[year] = value;
    });
    current_year = current_year !== null && current_year !== void 0 ? current_year : new Date().getFullYear();
    const sorted_years = Object.keys(aggregated_data).sort();
    const past_and_present = [];
    const future = [];
    sorted_years.forEach(year => {
        const timestamp = new Date(`${year}-01-01T00:00:00.000Z`).getTime();
        const value = aggregated_data[year];
        if (value === null) {
            return;
        }
        if (+year <= current_year || !split_future) {
            past_and_present.push([timestamp, value]);
        }
        else {
            if (future.length === 0 && past_and_present.length > 0) {
                const last_past = past_and_present[past_and_present.length - 1];
                future.push({
                    value: [...last_past],
                    symbolSize: 0,
                });
            }
            future.push({
                value: [timestamp, value],
                symbolSize: 7,
            });
        }
    });
    return { past_and_present, future };
};
// categorizeSeriesData categorizes the series data by the given timeline
export const categorizeSeriesData = (series, timeline, split = false, current_year = null) => {
    const actual_year = current_year !== null && current_year !== void 0 ? current_year : new Date().getFullYear();
    return series.flatMap(serie => {
        var _a, _b;
        if (!Array.isArray(serie.data)) {
            return serie;
        }
        const data_map = new Map();
        serie.data.forEach((d) => {
            if (Array.isArray(d) && d.length > 1) {
                const year = new Date(d[0]).getFullYear();
                data_map.set(year, d[1]);
            }
        });
        const categorized_data = timeline.map(year => { var _a; return (_a = data_map.get(year)) !== null && _a !== void 0 ? _a : null; });
        if (!split) {
            return Object.assign(Object.assign({}, serie), { data: categorized_data });
        }
        const past_data = timeline.map((year, i) => year <= actual_year ? categorized_data[i] : null);
        const future_data = timeline.map((year, i) => {
            if (year >= actual_year) {
                return categorized_data[i];
            }
            return null;
        });
        const base_id = (_b = (_a = serie.id) !== null && _a !== void 0 ? _a : serie.name) !== null && _b !== void 0 ? _b : 'series';
        return [
            Object.assign(Object.assign({}, serie), { id: `${base_id}-past`, data: past_data }),
            Object.assign(Object.assign({}, serie), { id: `${base_id}-future`, name: serie.name, data: future_data, lineStyle: { type: 'dashed' }, showSymbol: true, symbolSize: 7 }),
        ];
    });
};
// calculate a nice minimum for chart axes
export const axisMinimum = (axisValues) => {
    const realMin = axisValues.min;
    if (!isFinite(realMin) || realMin <= 0) {
        return 0;
    }
    const power = Math.floor(Math.log10(realMin));
    const base = Math.pow(10, power);
    const step = base;
    const withBuffer = realMin * 0.8;
    const niceMin = Math.floor(withBuffer / step) * step;
    return niceMin;
};
// format axis values with dot as thousand separator
export const axisFormatter = (value) => {
    if (typeof value === 'number') {
        if (value === 0) {
            return '';
        }
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    return value;
};
// getFullTimeline returns the full timeline for the given start and end year
export const getFullTimeline = (startYear, endYear) => {
    const timeline = [];
    for (let year = startYear; year <= endYear; year++) {
        timeline.push(year);
    }
    return timeline;
};
// getTimelineFromSeries returns the timeline from the given series
export const getTimelineFromSeries = (series, fill_gaps = true) => {
    const timeline = [];
    series.forEach(serie => {
        if (Array.isArray(serie.data)) {
            serie.data.forEach((d) => {
                if (Array.isArray(d) && d.length > 1) {
                    const year = new Date(d[0]).getFullYear();
                    if (!timeline.includes(year)) {
                        timeline.push(year);
                    }
                }
            });
        }
    });
    if (fill_gaps) {
        return getFullTimeline(Math.min(...timeline), Math.max(...timeline));
    }
    return timeline.sort((a, b) => a - b);
};
