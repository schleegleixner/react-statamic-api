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
// calculate the trendline using linear regression
export const calculateTrendline = (data) => {
    const parseDate = (date) => {
        if (typeof date === 'number') {
            return date;
        }
        const asNumber = Number(date);
        return !isNaN(asNumber) ? asNumber : new Date(date).getTime();
    };
    const isValidDataPoint = (item) => Array.isArray(item) &&
        item.length === 2 &&
        !isNaN(parseDate(item[0])) &&
        item[1] !== null &&
        !isNaN(Number(item[1]));
    // consolidate data points with the same x-value by aggregating their y-values
    const merged = {};
    data.filter(isValidDataPoint).forEach(([timestamp, value]) => {
        merged[timestamp] = (merged[timestamp] || 0) + value;
    });
    const points = Object.entries(merged).map(([timestamp, value]) => [parseDate(timestamp), value]);
    if (points.length === 0) {
        return [];
    }
    // calculate sums for linear regression in a single pass
    const { sumX, sumY, sumXY, sumX2 } = points.reduce((acc, [x, y]) => ({
        sumX: acc.sumX + x,
        sumY: acc.sumY + y,
        sumXY: acc.sumXY + x * y,
        sumX2: acc.sumX2 + x * x,
    }), { sumX: 0, sumY: 0, sumXY: 0, sumX2: 0 });
    const n = points.length;
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return points.map(([x]) => [x, slope * x + intercept]);
};
// getSplitSeries splits the data into past/present and future series (only linechart)
export const getSplitSeries = (data, property, split_future = true) => {
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
    const current_year = new Date().getFullYear();
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
