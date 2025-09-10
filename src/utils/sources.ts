import { sanitizeLocalizedValue } from '../utils/sanitize'
import { TableRowType } from '../types/tiles'
import { TileDatasourceType } from '../types/tiles'

export interface DataValue {
  current: number | null
  previous: number | null
}

export type RowDataType = DataValue & {
  label: string
  unit: string | null
  icon: string | null
  variant?: string | null
  decimals?: number | null
  divider: boolean
}

export type RowDataCollection = Record<string, RowDataType>

export type InputDataType = {
  INDEX: number
  [key: string]: number | undefined
}

export function getTimeline(
  data: InputDataType[],
  key: string = 'INDEX',
): number[] {
  if (!data || data.length === 0) {
    return []
  }

  // normalize the key to be case-insensitive
  const normalizedKey = key.toLowerCase()

  return (
    data
      .map(e => {
        const matchedKey = Object.keys(e).find(
          k => k.toLowerCase() === normalizedKey,
        )
        return matchedKey ? e[matchedKey] : undefined
      })
      .filter((year): year is number => year !== undefined) ?? []
  )
}

function checkValue(value: any, multiplier: number = 1): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return sanitizeLocalizedValue(value) * multiplier
}

export function getReducedValue(
  values: Record<string, DataValue>,
  keys: string[],
): DataValue {
  return Object.keys(values)
    .filter(key => keys.includes(key))
    .reduce(
      (acc, key) => {
        acc.current += values[key].current ?? 0

        if (values[key]?.previous === null) {
          acc.previous = null
        } else if (acc.previous !== null) {
          acc.previous += values[key].previous ?? 0
        }

        return acc
      },
      { current: 0, previous: 0 as number | null },
    )
}

export function countDecimals(value: number): number {
  return Math.floor(value) === value
    ? 0
    : value.toString().split('.')[1]?.length || 0
}

function getMaxDecimals(values: number[]): number {
  return values.length > 0 ? Math.max(...values.map(countDecimals)) : 0
}

export function getDatasetByKey(
  datasource: TileDatasourceType,
  key: string,
): number[] {
  return [...datasource.content]
    .sort((a, b) => +a.INDEX - +b.INDEX)
    .map(r => Number(r[key]) || 0)
}

export function getDatasetByIndex(
  datasource: TileDatasourceType,
  needle_index: string | number,
): InputDataType | null {
  const index_str = String(needle_index)
  return datasource.content.find(row => String(row.INDEX) === index_str) ?? null
}

export function getRows(
  datasource: TileDatasourceType,
  yearIndex?: number,
): RowDataCollection {
  const rows: TableRowType[] | null = datasource.table_rows ?? []
  yearIndex = yearIndex ?? datasource.entry_count

  if (!rows?.length || !datasource) {
    return {}
  }

  const current = datasource.content[yearIndex] ?? null
  const previous =
    yearIndex > 0 ? (datasource.content[yearIndex - 1] ?? null) : null

  if (!current || typeof current !== 'object') {
    return {}
  }

  const newValues: RowDataCollection = {}

  rows.forEach(row => {
    const keys = row.key.split(';').map(key => key.trim())
    const multiplier = row.multiplier ?? 1

    let aggregatedCurrent: number | null = null
    let aggregatedPrevious: number | null = null

    // collect all values for the keys
    const all_values: number[] = keys.flatMap(key => {
      const effectiveKey = key.startsWith('-') ? key.slice(1) : key

      return datasource.content
        .map(item => checkValue(item[effectiveKey], multiplier))
        .filter((v): v is number => v !== null)
    })

    // get the maximum number of decimals
    const decimals = row.decimals ?? getMaxDecimals(all_values)

    // iterate over all keys
    keys.forEach(key => {
      const isNegative = key.startsWith('-')
      const effectiveKey = isNegative ? key.slice(1) : key
      const effectiveMultiplier = isNegative ? -multiplier : multiplier

      const currentValue =
        current && effectiveKey in current
          ? checkValue(current[effectiveKey], effectiveMultiplier)
          : null

      if (currentValue !== null) {
        aggregatedCurrent = (aggregatedCurrent ?? 0) + currentValue
      }

      const previousValue =
        previous && effectiveKey in previous
          ? checkValue(previous[effectiveKey], effectiveMultiplier)
          : null

      if (previousValue !== null) {
        aggregatedPrevious = (aggregatedPrevious ?? 0) + previousValue
      }
    })

    // Füge berechnete Werte hinzu
    newValues[row.key] = {
      current: aggregatedCurrent,
      previous: aggregatedPrevious,
      label: row.label ?? row.key,
      unit: row.unit ?? null,
      icon: row.icon ?? null,
      variant: row.variant ?? null,
      decimals,
      divider: row.divider ?? true,
    }
  })

  return newValues
}