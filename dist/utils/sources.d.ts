import { PayloadDataType } from '../utils/import';
import { TileDatasourceType, TilePayloadType } from '../types/tiles';
export interface DataValue {
    current: number | null;
    previous: number | null;
}
export type RowDataType = DataValue & {
    label: string;
    unit: string | null;
    icon: string | null;
    variant?: string | null;
    decimals?: number | null;
    divider: boolean;
};
export type RowDataCollection = Record<string, RowDataType>;
export declare function getTimeline(data: PayloadDataType[], key?: string): number[];
export declare function getCompiledDatasource(tile_payload: TilePayloadType, datasource_id: string | number): TileDatasourceType | null;
export declare function getRows(datasource: TileDatasourceType, yearIndex?: number): {
    rows: RowDataCollection;
    row_count: number;
};
