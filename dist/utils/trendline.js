// calculate the trendline using linear regression
export const calculateTrendline = (data, timeline) => {
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
    // if timeline is set, calculate the values for each year in the format [year, value]
    if (timeline && timeline.length > 0) {
        return timeline.map(year => {
            const timestamp = new Date(`${year}-01-01T00:00:00.000Z`).getTime();
            const value = slope * timestamp + intercept;
            return [year, value];
        });
    }
    return points.map(([x]) => [x, slope * x + intercept]);
};
// getTrendlineSeries returns the trendline series for the given series and timeline
export const getTrendlineSeries = (series, trendlineStyle, timeline) => {
    const trendlineData = calculateTrendline([...series].flatMap(s => s.data), timeline);
    let timelineData = null;
    if (timeline) {
        // extract only the value from the trendline data (format: [year, value]) and return as [value, value, ...]
        timelineData = trendlineData
            .filter((d) => timeline.includes(d[0]))
            .map((d) => d[1]);
    }
    const trendlineSeries = Object.assign({ type: 'line', data: timelineData !== null && timelineData !== void 0 ? timelineData : trendlineData, name: 'Trend', smooth: true, symbol: 'none', emphasis: {
            lineStyle: {
                opacity: 1, // change color on hover
            },
        }, markLine: {} }, trendlineStyle);
    return trendlineSeries;
};
