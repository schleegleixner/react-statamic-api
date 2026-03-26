import { InputDataType } from '../types/tiles'
import type { SeriesOption } from 'echarts'

// getSplitSeries splits the data into past/present and future series (only linechart)
export const getSplitSeries = (
  data: InputDataType[],
  property: keyof InputDataType,
  split_future: boolean = true,
  current_year: number | null = null
) => {
  const aggregated_data: Record<string, number | null> = {}

  data.forEach(item => {
    const year = item.INDEX?.toString()
    const value = item[property]
    if (
      !year ||
      isNaN(+year) ||
      year.length !== 4 ||
      +year < 1800 ||
      +year > 2100
    ) {
      return
    }
    aggregated_data[year] = value
  })

  current_year = current_year ?? new Date().getFullYear()
  const sorted_years = Object.keys(aggregated_data).sort()
  const past_and_present: [number, number | null][] = []
  const future: { value: [number, number | null]; symbolSize: number }[] = []

  sorted_years.forEach(year => {
    const timestamp = new Date(`${year}-01-01T00:00:00.000Z`).getTime()
    const value = aggregated_data[year]

    if (value === null) {
      return
    }

    if (+year <= current_year || !split_future) {
      past_and_present.push([timestamp, value])
    } else {
      if (future.length === 0 && past_and_present.length > 0) {
        const last_past = past_and_present[past_and_present.length - 1]
        future.push({
          value: [...last_past] as [number, number | null],
          symbolSize: 0,
        })
      }

      future.push({
        value: [timestamp, value],
        symbolSize: 7,
      })
    }
  })

  return { past_and_present, future }
}

// categorizeSeriesData categorizes the series data by the given timeline
export const categorizeSeriesData = (
  series: SeriesOption[],
  timeline: number[],
  split: boolean = false,
  current_year: number | null = null
): SeriesOption[] => {
  const actual_year = current_year ?? new Date().getFullYear()

  const hasData = (data: (number | null)[]) => data.some(d => d !== null)

  return series.flatMap(serie => {
    if (!Array.isArray(serie.data)) { return serie }

    const data_map = new Map<number, number>()
    serie.data.forEach((d: number | [number, number]) => {
      const data = Array.isArray(d) ? d : (d as any).value
      if (Array.isArray(data) && data.length > 1) {
        const year = new Date(data[0]).getFullYear()
        data_map.set(year, data[1])
      }
    })

    const categorized_data = timeline.map(year => data_map.get(year) ?? null)

    if (!split) {
      return hasData(categorized_data) ? { ...serie, data: categorized_data } as SeriesOption : []
    }

    const past_data = timeline.map((year, i) => year <= actual_year ? categorized_data[i] : null)
    const future_data = timeline.map((year, i) => year >= actual_year ? categorized_data[i] : null)

    const base_id = (serie as any).id ?? serie.name ?? 'series'

    return [
      hasData(past_data) && {
        ...serie,
        id: `${base_id}-past`,
        data: past_data,
      },
      hasData(future_data) && {
        ...serie,
        id: `${base_id}-future`,
        name: serie.name,
        data: future_data,
        lineStyle: { type: 'dashed' },
        showSymbol: true,
        symbolSize: 7,
      },
    ].filter(Boolean) as SeriesOption[]
  })
}

// calculate a nice minimum for chart axes
export const axisMinimum = (axisValues: { min: number; max: number }) => {
  const realMin = axisValues.min
  if (!isFinite(realMin) || realMin <= 0) {
    return 0
  }

  const power = Math.floor(Math.log10(realMin))
  const base = Math.pow(10, power)
  const step = base
  const withBuffer = realMin * 0.8
  const niceMin = Math.floor(withBuffer / step) * step
  return niceMin
}

// format axis values with dot as thousand separator
export const axisFormatter = (value: number | string) => {
  if (typeof value === 'number') {
    if (value === 0) {
      return ''
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }
  return value
}

// getFullTimeline returns the full timeline for the given start and end year
export const getFullTimeline = (startYear: number, endYear: number) => {
  const timeline: number[] = []
  for (let year = startYear; year <= endYear; year++) {
    timeline.push(year as unknown as number)
  }
  return timeline
}

// getTimelineFromSeries returns the timeline from the given series
export const getTimelineFromSeries = (series: SeriesOption[], fill_gaps: boolean = true) => {
  const timeline: number[] = []
  series.forEach(serie => {
    if (Array.isArray(serie.data)) {
      serie.data.forEach((d: any) => {
        const data = Array.isArray(d) ? d : d.value
        if (Array.isArray(data) && data.length > 1) {
          const year = new Date(data[0]).getFullYear()
          if (!timeline.includes(year)) {
            timeline.push(year)
          }
        }
      })
    }
  })
  if (fill_gaps) {
    return getFullTimeline(Math.min(...timeline), Math.max(...timeline))
  }
  return timeline.sort((a, b) => a - b)
}
