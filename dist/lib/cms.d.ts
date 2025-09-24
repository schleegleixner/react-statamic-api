import { ResultType } from '../types/cms';
export declare function fetchFromStatamic(): Promise<ResultType>;
export declare function getAPI(api: string, use_cache?: boolean, lifetime?: number): Promise<any>;
type RebuildResult = {
    name: string;
    success: boolean;
};
export declare function rebuildCache(): Promise<false | ({
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
export {};
