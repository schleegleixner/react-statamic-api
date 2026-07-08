export declare function getAppVersion(): string;
export declare function readLocalStorage(key: string, site_id?: string): any;
export interface LocalStorageMeta<T = unknown> {
    data: T;
    /** Absolute expiry timestamp in ms. */
    expires: number;
    /** When the entry was written, in ms. `null` for legacy entries. */
    written: number | null;
    /** True once `expires` has passed (entry is kept, not removed). */
    is_expired: boolean;
}
/**
 * Like `readLocalStorage` but returns cache metadata and, crucially, does NOT
 * delete expired entries. This lets callers (e.g. `useLiveData`) keep showing
 * the last known value offline while flagging it as stale.
 */
export declare function readLocalStorageWithMeta<T = unknown>(key: string, site_id?: string): LocalStorageMeta<T> | null;
export declare function removeLocalStorage(key: string, site_id?: string): boolean;
export declare function writeLocalStorage(key: string, payload: unknown, lifetime?: number, site_id?: string): boolean;
