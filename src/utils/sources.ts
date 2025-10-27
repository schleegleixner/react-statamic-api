import { PayloadDataType } from '../utils/import'
import { getDataSource } from '../utils/payload'
import { TileDatasourceType, TilePayloadType } from '../types/tiles'
import { InputDataType, TableRowType } from '../types/tiles'

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
  hide_trend: boolean
}

export type RowDataCollection = Record<string, RowDataType>

const sanitizeLocalizedValue = (value: string | number): number => {
  const valueAsString = value.toString()
  const sanitized = valueAsString.replace(/,/g, '.')
  return parseFloat(sanitized) || 0
}

function checkValue(value: any, multiplier: number = 1): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return sanitizeLocalizedValue(value) * multiplier
}

function countDecimals(value: number): number {
  return Math.floor(value) === value
    ? 0
    : value.toString().split('.')[1]?.length || 0
}

function getMaxDecimals(values: number[]): number {
  return values.length > 0 ? Math.max(...values.map(countDecimals)) : 0
}

export function getTimeline(
  data: PayloadDataType[],
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

export function getCompiledDatasource(
  tile_payload: TilePayloadType,
  datasource_id: string | number,
): TileDatasourceType | null {
  const datasource = getDataSource(tile_payload, datasource_id)
  if (!datasource?.content?.length) {
    return null
  }

  const cloned_datasource: TileDatasourceType = JSON.parse(
    JSON.stringify(datasource),
  )

  cloned_datasource.content = cloned_datasource.content
    .map((row: InputDataType) => {
      let is_valid = false
      const new_row: InputDataType = { INDEX: row.INDEX }

      cloned_datasource.table_rows?.forEach((table_row: TableRowType) => {
        const keys = table_row.key.split(';').map(k => k.trim())
        const multiplier = table_row.multiplier ?? 1
        let value: number | null = null

        keys.forEach(key => {
          const is_negative = key.startsWith('-')
          const effective_key = is_negative ? key.slice(1) : key
          const effective_multiplier = is_negative ? -multiplier : multiplier
          const original_value = row[effective_key]

          if (original_value != null && !isNaN(original_value * 1)) {
            const checked_value = checkValue(
              original_value,
              effective_multiplier,
            )
            if (checked_value !== null) {
              value = (value ?? 0) + checked_value
            }
          }
        })

        if (value != null) {
          new_row[table_row.key] =
            typeof table_row.decimals === 'number'
              ? parseFloat((value as number).toFixed(table_row.decimals))
              : value
          is_valid = true
        }
      })

      return is_valid ? new_row : null
    })
    .filter(row => row !== null)

  return cloned_datasource.content.length ? cloned_datasource : null
}

export function getRows(
  datasource: TileDatasourceType,
  yearIndex?: number,
): { rows: RowDataCollection; row_count: number } {
  const rows: TableRowType[] | null = datasource.table_rows ?? []
  yearIndex = yearIndex ?? datasource.entry_count

  if (!rows?.length || !datasource) {
    return {
      rows: {},
      row_count: 0,
    }
  }

  const current = datasource.content[yearIndex] ?? null
  const previous =
    typeof yearIndex === 'number' && yearIndex > 0
      ? (datasource.content[yearIndex - 1] ?? null)
      : null

  if (!current || typeof current !== 'object') {
    return {
      rows: {},
      row_count: 0,
    }
  }

  const new_values: RowDataCollection = {}

  rows.forEach(row => {
    const current_value = current[row.key]
    const previous_value =
      previous && row.key in previous ? (previous[row.key] ?? null) : null

    // collect all values for the keys
    const all_values: number[] = datasource.content
      .map((item: InputDataType) => checkValue(item[row.key]))
      .filter((v: number | null): v is number => v !== null)

    // get the maximum number of decimals
    const decimals = row.decimals ?? getMaxDecimals(all_values)

    new_values[row.key] = {
      current: current_value,
      previous: previous_value,
      label: row.label ?? row.key,
      unit: row.unit ?? null,
      icon: row.icon ?? null,
      variant: row.variant ?? null,
      decimals,
      divider: row.divider ?? true,
      hide_trend: row.hide_trend ?? false,
    }
  })

  return {
    rows: new_values,
    row_count: Object.keys(new_values).length,
  }
}
