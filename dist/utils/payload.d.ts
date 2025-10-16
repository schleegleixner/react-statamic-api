import { TileDatasourceType, TilePayloadType } from '../types/tiles';
export type PayloadDataType = {
    [key: string]: string;
};
export declare function getDataPoint(tile_payload: TilePayloadType, key: string, fallback?: number): number;
export declare function getString(tile_payload: TilePayloadType, key: string, fallback?: string): string;
export declare function getAllStrings(tile_payload: TilePayloadType): PayloadDataType;
export declare function getDataSource(tile_payload: TilePayloadType, find?: string | number | boolean): TileDatasourceType | null;
export declare function getSource(tile_payload: TilePayloadType, find?: string | number | boolean, fallback?: any): any | null;
