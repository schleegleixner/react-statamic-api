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
  const seen = new Set<string>()

  // filter duplicates by seriesName
  const uniqueParams = params.filter(
    (item: any, index: number, self: any[]) =>
      index ===
      self.findIndex((obj: any) => obj.seriesName === item.seriesName),
  )

  let year: string | number = ''
  const seriesData: TooltipSeriesDataType[] = []

  for (const series of uniqueParams) {
    const seriesName = series.seriesName

    if (
      series.value === null ||
      series.value === undefined ||
      seen.has(seriesName) ||
      seriesName.toLowerCase() === 'trend' ||
      seriesName.toLowerCase() === 'trendline'
    ) {
      continue
    }

    // extract year only once
    if (seen.size === 0) {
      year = series.axisValue ?? new Date(series.value[0]).getFullYear()
    }

    seen.add(seriesName)

    const value =
      Array.isArray(series.value) && series.value.length > 1
        ? series.value[1].toLocaleString('de-DE')
        : series.value.toLocaleString('de-DE')

    const unit =
      Object.values(indices).find(i => i.title === seriesName)?.unit ?? ''

    seriesData.push({
      label: seriesName,
      value,
      unit,
      marker: series.marker,
    })
  }

  if (seriesData.length === 0) {
    return null
  }

  return {
    year,
    series: seriesData,
  }
}
