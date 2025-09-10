import { TileDatasourceType } from '../types/tiles';
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
export type InputDataType = {
    INDEX: number;
    [key: string]: number | undefined;
};
export declare function getTimeline(data: InputDataType[], key?: string): number[];
export declare function getReducedValue(values: Record<string, DataValue>, keys: string[]): DataValue;
export declare function countDecimals(value: number): number;
export declare function getDatasetByKey(datasource: TileDatasourceType, key: string): number[];
export declare function getDatasetByIndex(datasource: TileDatasourceType, needle_index: string | number): InputDataType | null;
export declare function getRows(datasource: TileDatasourceType, yearIndex?: number): RowDataCollection;
