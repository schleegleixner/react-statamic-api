import { RebuildResult, ResultType } from '../types/cms';
export declare function fetchFromStatamic(sites: string[]): Promise<ResultType>;
export declare function getAPI(api: string, use_cache?: boolean, lifetime?: number): Promise<any>;
export declare function rebuildCache(sites: string[]): Promise<false | ({
    site_id: string;
    result: RebuildResult[];
    name?: undefined;
    success?: undefined;
    error?: undefined;
} | {
    name: string;
    success: boolean;
    error: unknown;
    site_id?: undefined;
    result?: undefined;
})[]>;
