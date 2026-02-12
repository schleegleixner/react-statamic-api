import { TileDatasourceType, TilePayloadType } from '../types/tiles';
export declare function getValue(tile_payload: TilePayloadType, key: string, fallback: string | number | boolean | null | undefined, attribute: string): string | number | boolean | null;
export declare function getValues(tile_payload: TilePayloadType, defaults: {
    [key: string]: number | boolean | string | null;
} | undefined, attribute: string): {
    [key: string]: number | boolean | string | null;
};
export declare function getDataPoint(tile_payload: TilePayloadType, key: string, fallback?: number | boolean | null): number | boolean | null;
export declare function getDatapoints(tile_payload: TilePayloadType, defaults?: {
    [key: string]: number;
}): {
    [key: string]: number | boolean | null;
};
export declare function getSetting<T extends Record<string, any>>(tile_payload: TilePayloadType, key: string, fallback?: string | number | boolean | null): T | null;
export declare function getSettings<T extends Record<string, any>>(tile_payload: TilePayloadType, defaults?: T): T;
export declare function getString(tile_payload: TilePayloadType, key: string, fallback?: string): string;
export declare function getStrings(tile_payload: TilePayloadType, defaults?: {
    [key: string]: string;
}): {
    [key: string]: string;
};
export declare function getDataSource(tile_payload: TilePayloadType, find?: string | number | boolean): TileDatasourceType | null;
export declare function getDataSourceContent(tile_payload: TilePayloadType, find?: string | number | boolean, fallback?: any): any | null;
