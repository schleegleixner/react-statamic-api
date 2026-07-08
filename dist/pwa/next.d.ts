import type { NextConfig } from 'next';
export interface WithPWAOptions {
    /** Source of the service worker (relative to project root). Default: `app/sw.ts`. */
    swSrc?: string;
    /** Output path of the compiled service worker. Default: `public/sw.js`. */
    swDest?: string;
    /** Disable the PWA entirely. Defaults to `true` in development. */
    disable?: boolean;
    /** Register the service worker automatically. Default: `true`. */
    register?: boolean;
    /** Serve cached responses while navigating. Default: `true`. */
    cacheOnNavigation?: boolean;
    /** Reload open clients once the network comes back. Default: `true`. */
    reloadOnOnline?: boolean;
    /** Any additional option accepted by `@serwist/next`. */
    [key: string]: unknown;
}
/**
 * Wraps a Next.js config with a sensible Serwist setup so consumers only need a
 * single call. Existing config is preserved. PWA-only, safe to omit for
 * non-PWA projects (this module is exposed via the `./pwa/next` subpath and is
 * never pulled into the main entry point).
 */
export default function withPWA(nextConfig?: NextConfig, options?: WithPWAOptions): NextConfig;
