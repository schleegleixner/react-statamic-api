export interface LiveDataResult<T = unknown> {
    data: T | null;
    /** When the returned data was fetched, in ms. `null` if unknown. */
    cached_at: number | null;
    /** Absolute expiry timestamp in ms. `null` if unknown. */
    expires: number | null;
    /** True when the data was served from (a possibly expired) local cache. */
    from_cache: boolean;
}
/**
 * Like `getLiveData`, but returns cache metadata and, when the network fails,
 * falls back to expired local cache instead of returning nothing. Powers the
 * "stale" detection in `useLiveData`.
 */
export declare function getLiveDataWithMeta<T = unknown>(route: string, lifetime?: number): Promise<LiveDataResult<T>>;
export default function getLiveData(route: string, lifetime?: number, default_value?: any, use_local_storage?: boolean): Promise<any>;
