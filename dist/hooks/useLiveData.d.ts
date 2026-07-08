export type LiveDataStatus = 'idle' | 'loading' | 'success' | 'error';
export interface UseLiveDataResult<T> {
    data: T | null;
    status: LiveDataStatus;
    /** When the current data was fetched, in ms. `null` if unknown. */
    cached_at: number | null;
    /** Absolute expiry timestamp in ms. `null` if unknown. */
    expires: number | null;
    /** True when offline or the cached data is past its lifetime. */
    is_stale: boolean;
    /** Reactive online flag. */
    is_online: boolean;
}
/**
 * Drop-in replacement for `useApi` that additionally surfaces staleness so the
 * UI can flag live data as outdated when running offline or from an expired
 * cache. Reuses the same localStorage cache as `useApi`.
 */
export default function useLiveData<T>(route: string, lifetime?: number, auto_update?: boolean): UseLiveDataResult<T>;
