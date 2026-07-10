export declare function readCache(site_id: string | undefined, content_type: string, folder?: string | boolean, id?: string | number | boolean, ignore_stale?: boolean): Promise<any>;
export declare function readApiCache(file_name: string): Promise<any>;
export interface CachedApiFile {
    data: any;
    expired: boolean;
}
/**
 * Read an API cache entry straight from disk.
 *
 * Unlike `readApiCache`, this deliberately avoids the self-HTTP roundtrip
 * against `NEXT_PUBLIC_URL/api/cache`. The data route runs inside the same
 * Next.js server that owns the cache files, so reading the filesystem directly
 * removes an entire class of failures (DNS/TLS/hairpin/CDN/timeouts) and works
 * even when the public URL is unreachable from the server itself.
 *
 * Handles both cache shapes transparently:
 *  - wrapped `{ payload, expiry }` files written by this library
 *  - bare JSON files (e.g. arrays written by external scripts) without expiry
 */
export declare function readApiCacheFile(file_name: string): CachedApiFile | null;
export declare function writeContentCache(site_id: string | undefined, content_type: string, folder_path: string | boolean | undefined, id: string | number | boolean | undefined, data: any, lifetime?: number | boolean): Promise<void>;
export declare function writeApiCache(file_name: string, data: any, lifetime?: number, folder?: string): Promise<void>;
export declare function writeFile(file_path: string, data: any): Promise<boolean>;
export declare function writeBuffer(file_path: string, buffer: Buffer): Promise<boolean>;
