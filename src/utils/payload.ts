import {
  TileDatasourceType,
  TilePayloadType,
} from '../types/tiles'
import { castValue } from './convert'

export function getValue(
  tile_payload: TilePayloadType,
  key: string,
  fallback: string | number | boolean | null = null,
  attribute: string
): string | number | boolean | null {
  const value =
    tile_payload[attribute]?.find(
      (val: { id: string; val: string | number | boolean }) => val.id === key,
    ) || null

  if (value) {
    return castValue(value.val)
  }

  return fallback
}

export function getValues(
  tile_payload: TilePayloadType,
  defaults: { [key: string]: number | boolean | string | null } = {},
  attribute: string
): { [key: string]: number | boolean | string | null } {
  const values = tile_payload[attribute] ?? {}
  const casted = Object.fromEntries(
    Object.entries(values).map(([key, val]) => [key, castValue(val)]),
  )
  return { ...defaults, ...casted }
}

export function getDataPoint(
  tile_payload: TilePayloadType,
  key: string,
  fallback: number | boolean | null = null,
): number | boolean | null {
  const result = getValue(tile_payload, key, fallback, 'datapoints')
  return result as number | boolean | null
}

export function getDatapoints(
  tile_payload: TilePayloadType,
  defaults: { [key: string]: number } = {},
): { [key: string]: number | boolean | null } {
  const result = getValues(tile_payload, defaults, 'datapoints')
  return result as { [key: string]: number | boolean | null }
}

export function getSetting<T extends Record<string, any>>(
  tile_payload: TilePayloadType,
  key: string,
  fallback: string | number | boolean | null = null,
): T | null {
  const result = getValue(tile_payload, key, fallback, 'settings')
  return result as T | null
}

export function getSettings<T extends Record<string, any>>(
  tile_payload: TilePayloadType,
  defaults: T = {} as T,
): T {
  const result = getValues(tile_payload, defaults, 'settings')
  return result as T
}

export function getString(
  tile_payload: TilePayloadType,
  key: string,
  fallback: string = ''
): string {
  const result = getValue(tile_payload, key, fallback, 'strings')
  return result as string
}

export function getStrings(
  tile_payload: TilePayloadType,
  defaults: { [key: string]: string } = {},
): { [key: string]: string } {
  const result = getValues(tile_payload, defaults, 'strings')
  return result as { [key: string]: string }
}

export function getDataSource(
  tile_payload: TilePayloadType,
  find: string | number | boolean = true,
): TileDatasourceType | null {
  const datasources = tile_payload.datasources
  if (!Array.isArray(datasources) || datasources.length === 0) {
    return null
  }

  // get first datasource if find is true
  if (find === true) {
    return datasources[0] ?? null
  }

  if (typeof find === 'number') {
    return datasources[find] ?? null
  }

  if (typeof find === 'string') {
    const found = datasources.find(entry => entry.file_name === find)
    return found ?? null
  }

  return null
}

export function getDataSourceContent(
  tile_payload: TilePayloadType,
  find: string | number | boolean = true,
  fallback: any = null,
): any | null {
  return getDataSource(tile_payload, find)?.content ?? fallback
}
