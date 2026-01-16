import type { SeriesOption } from 'echarts'

// calculate the trendline using linear regression
export const calculateTrendline = (
  data: [string, number][],
  timeline?: number[],
): [number, number][] => {
  const parseDate = (date: string | number): number => {
    if (typeof date === 'number') {
      return date
    }
    const asNumber = Number(date)
    return !isNaN(asNumber) ? asNumber : new Date(date).getTime()
  }

  const isValidDataPoint = (item: unknown): item is [string | number, number] =>
    Array.isArray(item) &&
    item.length === 2 &&
    !isNaN(parseDate(item[0])) &&
    item[1] !== null &&
    !isNaN(Number(item[1]))

  // consolidate data points with the same x-value by aggregating their y-values
  const merged: Record<string, number> = {}
  data.filter(isValidDataPoint).forEach(([timestamp, value]) => {
    merged[timestamp] = (merged[timestamp] || 0) + value
  })

  const points = Object.entries(merged).map(
    ([timestamp, value]) => [parseDate(timestamp), value] as [number, number],
  )

  if (points.length === 0) {
    return []
  }

  // calculate sums for linear regression in a single pass
  const { sumX, sumY, sumXY, sumX2 } = points.reduce(
    (acc, [x, y]) => ({
      sumX: acc.sumX + x,
      sumY: acc.sumY + y,
      sumXY: acc.sumXY + x * y,
      sumX2: acc.sumX2 + x * x,
    }),
    { sumX: 0, sumY: 0, sumXY: 0, sumX2: 0 },
  )

  const n = points.length
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // if timeline is set, calculate the values for each year in the format [year, value]
  if (timeline && timeline.length > 0) {
    return timeline.map(year => {
      const timestamp = new Date(`${year}-01-01T00:00:00.000Z`).getTime()
      const value = slope * timestamp + intercept
      return [year, value] as [number, number]
    })
  }

  return points.map(([x]) => [x, slope * x + intercept] as [number, number])
}

// getTrendlineSeries returns the trendline series for the given series and timeline
export const getTrendlineSeries = (
  series: SeriesOption[],
  trendlineStyle: SeriesOption,
  timeline?: number[],
): SeriesOption => {
  const trendlineData = calculateTrendline(
    [...series].flatMap(s => s.data) as [string, number][],
    timeline,
  ) as [number, number][]
  let timelineData: number[] | null = null

  if (timeline) {
    // extract only the value from the trendline data (format: [year, value]) and return as [value, value, ...]
    timelineData = trendlineData
      .filter((d: [number, number]) => timeline.includes(d[0]))
      .map((d: [number, number]) => d[1])
  }

  const trendlineSeries: SeriesOption = {
    type: 'line',
    data: timelineData ?? trendlineData,
    name: 'Trend',
    smooth: true,
    symbol: 'none', // hide small circles on the trendline initially
    emphasis: {
      lineStyle: {
        opacity: 1, // change color on hover
      },
    },
    markLine: {},
    ...(trendlineStyle as object),
  }

  return trendlineSeries
}
