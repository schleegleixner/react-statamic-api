import { TileDataType } from '../types/tiles';
export declare function getContent(collection_id?: string, id?: string | number | boolean): Promise<any>;
export declare function getGlobal(global_id: string): Promise<any>;
export declare function getCollection(collection_id?: string): Promise<any>;
export declare function getPopulatedCollection(collection_id?: string): Promise<any>;
export declare function getCachedData(api: string): Promise<any>;
export declare function getCompleteTileset(): Promise<TileDataType[]>;
