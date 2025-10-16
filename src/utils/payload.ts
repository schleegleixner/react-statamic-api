import {
  TileDatasourceType,
  TilePayloadType,
  TileStringType,
} from '../types/tiles'

export type PayloadDataType = {
  [key: string]: string
}

export function getDataPoint(
  tile_payload: TilePayloadType,
  key: string,
  fallback: number = 0,
): number {
  const datapoint =
    tile_payload.datapoints?.find(
      (datapoint: { id: string; val: number }) => datapoint.id === key,
    ) || null

  if (datapoint) {
    return datapoint.val
  }

  return fallback
}

export function getString(
  tile_payload: TilePayloadType,
  key: string,
  fallback: string = '',
): string {
  const string = tile_payload.strings?.find(string => string.id === key) || null

  if (string) {
    return string.val
  }

  return fallback
}

export function getAllStrings(tile_payload: TilePayloadType): PayloadDataType {
  return (
    tile_payload.strings?.reduce(
      (result: PayloadDataType, item: TileStringType) => {
        if (item.id && item.val) {
          result[item.id] = item.val
        }
        return result
      },
      {},
    ) || {}
  )
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

export function getSource(
  tile_payload: TilePayloadType,
  find: string | number | boolean = true,
  fallback: any = null,
): any | null {
  const datasources = tile_payload.datasources
  if (!Array.isArray(datasources) || datasources.length === 0) {
    return fallback
  }

  // get first datasource if find is true
  if (find === true) {
    return datasources[0]?.content ?? fallback
  }

  if (typeof find === 'number') {
    return datasources[find]?.content ?? fallback
  }

  if (typeof find === 'string') {
    const found = datasources.find(entry => entry.file_name === find)
    return found ? found.content : fallback
  }

  return fallback
}
