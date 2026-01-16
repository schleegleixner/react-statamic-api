export type TooltipIndexType = {
  title: string
  unit?: string
  [key: string]: any
}

export type TooltipSeriesDataType = {
  label: string
  value: string
  unit: string
  marker: string
}

export type TooltipDataType = {
  year: string | number
  series: TooltipSeriesData[]
}
