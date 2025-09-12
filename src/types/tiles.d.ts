export type InputDataType = {
  INDEX: number
  [key: string]: number | undefined
}

export type TileTypePrefix = string
export type TileType = `${TileTypePrefix}-${string}` | string

export type TileStringType = {
  [key: string]: string
}

export type TileDatapointType = {
  id: string
  val: number
}

export type TableRowType = {
  key: string
  label: string | null
  unit?: string | null
  multiplier?: number | null
  visible?: boolean | null
  variant?: string | null
  icon?: string | null
  decimals?: number | null
  divider?: boolean | null
}

export type TileDatasourceType = {
  file_name: string
  label: string | null
  labely: string | null
  table_rows: TableRowType[] | null
  content: InputDataType[]
  timeline: number[]
  entry_count: number
  allow_download: boolean
}

export interface TilePayloadType {
  tile_id: string
  subtitle: string | null
  title: string | null
  copy: string | ReactElement<any, string | JSXElementConstructor<any>> | null
  details: string
  legend: string | null
  retrieval: string | null
  source: string | null
  strings: TileStringType[] | null
  datapoints: TileDatapointType[] | null
  layout: string | null
  tile_type: string | null
  tags: {
    category: string
    action_dimension: string
    action_field: string
    sdg_target: string
  }
  live: boolean | null
  search: string
  table_keys: string[] | null
  icon: string | null
  datasources: TileDatasourceType[] | null
}

export interface TileProps {
  type: TileType
  tile_payload: TilePayloadType
}

export type TileDataType = {
  tile_id: string
  title: string
  layout: 'default' | 'full'
  tags: {
    category: string
    action_dimension: string
    action_field: string
    sdg_target: string
  }
  search: string
  content?: TilePayloadType
}
