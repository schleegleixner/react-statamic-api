import { ResultType } from '../types/cms';
export declare function fetchFromStatamic(): Promise<ResultType>;
export declare function getAPI(api: string, use_cache?: boolean, lifetime?: number): Promise<any>;
type RebuildResult = {
    name: string;
    success: boolean;
};
export declare function rebuildCache(): Promise<false | RebuildResult[]>;
export {};
