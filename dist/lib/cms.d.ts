import { FlushRelease, RebuildResult, ResultType } from '../types/cms';
export declare function fetchFromStatamic(sites: string[], release?: FlushRelease): Promise<ResultType>;
export declare function getAPI(api: string, use_cache?: boolean, lifetime?: number): Promise<any>;
export declare function rebuildCache(sites: string[], release?: FlushRelease): Promise<RebuildResult[]>;
