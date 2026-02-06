import {
  TooltipIndexType,
  TooltipSeriesDataType,
  TooltipDataType,
} from '../types/tooltips'

// parseTooltipParams parses the tooltip params and returns the tooltip data
export const parseTooltipParams = (
  params: any,
  indices: Record<string, TooltipIndexType>,
): TooltipDataType | null => {
  // Dedupe by seriesName, prefer items with actual values
  const seen_names = new Map<string, any>()

  for (const item of params) {
    const existing = seen_names.get(item.seriesName)

    if (!existing) {
      seen_names.set(item.seriesName, item)
      continue
    }

    // Prefer the item with an actual value over null
    const has_value = item.value !== null && item.value !== undefined
    const existing_has_value = existing.value !== null && existing.value !== undefined

    if (has_value && !existing_has_value) {
      seen_names.set(item.seriesName, item)
    }
  }

  const unique_params = Array.from(seen_names.values())

  let timestamp: string | number = ''
  let year: string | number = ''
  const series_data: TooltipSeriesDataType[] = []
  const seen = new Set<string>()

  for (const series of unique_params) {
    const series_name = series.seriesName

    if (
      series.value === null ||
      series.value === undefined ||
      seen.has(series_name) ||
      series_name.toLowerCase() === 'trend' ||
      series_name.toLowerCase() === 'trendline'
    ) {
      continue
    }

    if (seen.size === 0) {
      timestamp = year = series.axisValue ?? series.value[0]
      year = timestamp

      if (typeof year === 'number' && year > 3000) {
        if (year > 10000000000) {
          year = new Date(year).getFullYear()
        } else {
          year = new Date(year * 1000).getFullYear()
        }
      }
    }

    seen.add(series_name)

    const value =
      Array.isArray(series.value) && series.value.length > 1
        ? series.value[1].toLocaleString('de-DE')
        : series.value.toLocaleString('de-DE')

    const unit =
      Object.values(indices).find(i => i.title === series_name)?.unit ?? ''

    series_data.push({
      label: series_name,
      value,
      unit,
      marker: series.marker,
    })
  }

  if (series_data.length === 0) {
    return null
  }

  return {
    timestamp,
    year,
    series: series_data,
  }
}
