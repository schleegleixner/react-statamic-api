import { RebuildResult, ResultType } from '../types/cms';
export declare function fetchFromStatamic(sites: string[]): Promise<ResultType>;
export declare function getAPI(api: string, use_cache?: boolean, lifetime?: number): Promise<any>;
export declare function rebuildCache(sites: string[]): Promise<RebuildResult[]>;
