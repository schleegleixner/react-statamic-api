import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';
declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}
export interface RuntimeCachingOptions {
    /**
     * Matches the CMS/live-data API routes that should be served from cache when
     * offline. Default: `/api/data` and `/api/cache`.
     */
    liveDataMatcher?: RegExp;
    /** Hostname of the weather API cached for offline use. Default: BrightSky. */
    weatherHost?: string;
    /** Network timeout before falling back to cache (seconds). Default: `10`. */
    networkTimeoutSeconds?: number;
    /** Extra caching rules prepended before the defaults. */
    extraRuntimeCaching?: RuntimeCaching[];
}
/**
 * Builds the runtime caching rules for a Statamic-API driven PWA:
 * live data (`/api/data`, `/api/cache`) and weather use NetworkFirst so the
 * last successful response stays available offline; static assets use
 * CacheFirst. Next.js defaults (`defaultCache`) handle navigation/RSC and the
 * `_next` output.
 */
export declare function createRuntimeCaching(options?: RuntimeCachingOptions): RuntimeCaching[];
export interface SetupServiceWorkerOptions extends RuntimeCachingOptions {
    /** Override the full runtime caching list instead of extending defaults. */
    runtimeCaching?: RuntimeCaching[];
    /** Take control of open clients immediately. Default: `true`. */
    clientsClaim?: boolean;
    /** Activate a waiting worker without a reload. Default: `true`. */
    skipWaiting?: boolean;
    /** Use navigation preload. Default: `true`. */
    navigationPreload?: boolean;
}
/**
 * One-call service worker bootstrap for consumer projects. A consumer's
 * `app/sw.ts` only needs `setupServiceWorker()`.
 */
export declare function setupServiceWorker(options?: SetupServiceWorkerOptions): Serwist;
export default setupServiceWorker;
