/// <reference lib="webworker" />

import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from 'serwist'
import { CacheFirst, ExpirationPlugin, NetworkFirst, Serwist } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

export interface RuntimeCachingOptions {
  /**
   * Matches the CMS/live-data API routes that should be served from cache when
   * offline. Default: `/api/data` and `/api/cache`.
   */
  liveDataMatcher?: RegExp
  /** Hostname of the weather API cached for offline use. Default: BrightSky. */
  weatherHost?: string
  /** Network timeout before falling back to cache (seconds). Default: `10`. */
  networkTimeoutSeconds?: number
  /** Extra caching rules prepended before the defaults. */
  extraRuntimeCaching?: RuntimeCaching[]
}

/**
 * Builds the runtime caching rules for a Statamic-API driven PWA:
 * live data (`/api/data`, `/api/cache`) and weather use NetworkFirst so the
 * last successful response stays available offline; static assets use
 * CacheFirst. Next.js defaults (`defaultCache`) handle navigation/RSC and the
 * `_next` output.
 */
export function createRuntimeCaching(
  options: RuntimeCachingOptions = {},
): RuntimeCaching[] {
  const {
    liveDataMatcher = /\/api\/(data|cache)/,
    weatherHost = 'api.brightsky.dev',
    networkTimeoutSeconds = 10,
    extraRuntimeCaching = [],
  } = options

  const custom: RuntimeCaching[] = [
    {
      // Document navigations: keep the last successful HTML so previously
      // visited pages render on a cold offline start. Placed before the
      // Next.js defaults because their HTML matcher relies on a request
      // `Content-Type` header that navigations never send.
      matcher: ({ request, sameOrigin }) =>
        sameOrigin && request.mode === 'navigate',
      handler: new NetworkFirst({
        cacheName: 'rsa-pages',
        networkTimeoutSeconds,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    {
      matcher: ({ url }) => liveDataMatcher.test(url.pathname),
      handler: new NetworkFirst({
        cacheName: 'rsa-live-data',
        networkTimeoutSeconds,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    {
      matcher: ({ url }) => url.hostname === weatherHost,
      handler: new NetworkFirst({
        cacheName: 'rsa-weather',
        networkTimeoutSeconds,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60,
          }),
        ],
      }),
    },
    {
      matcher: ({ url, sameOrigin }) =>
        sameOrigin && url.pathname.startsWith('/images/'),
      handler: new CacheFirst({
        cacheName: 'rsa-images',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 128,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          }),
        ],
      }),
    },
  ]

  return [...extraRuntimeCaching, ...custom, ...defaultCache]
}

export interface SetupServiceWorkerOptions extends RuntimeCachingOptions {
  /** Override the full runtime caching list instead of extending defaults. */
  runtimeCaching?: RuntimeCaching[]
  /** Take control of open clients immediately. Default: `true`. */
  clientsClaim?: boolean
  /** Activate a waiting worker without a reload. Default: `true`. */
  skipWaiting?: boolean
  /** Use navigation preload. Default: `true`. */
  navigationPreload?: boolean
  /**
   * Precached URL served for document navigations when both network and
   * runtime cache miss (e.g. a cold offline start of a never-visited route).
   * The consumer must ship this as a static, precached route. Set to `false`
   * to disable. Default: `/~offline`.
   */
  offlineFallback?: string | false
}

/**
 * One-call service worker bootstrap for consumer projects. A consumer's
 * `app/sw.ts` only needs `setupServiceWorker()`.
 */
export function setupServiceWorker(
  options: SetupServiceWorkerOptions = {},
): Serwist {
  const {
    runtimeCaching,
    clientsClaim = true,
    skipWaiting = true,
    navigationPreload = true,
    offlineFallback = '/~offline',
    ...runtimeOptions
  } = options

  const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting,
    clientsClaim,
    navigationPreload,
    runtimeCaching: runtimeCaching ?? createRuntimeCaching(runtimeOptions),
    fallbacks: offlineFallback
      ? {
          entries: [
            {
              url: offlineFallback,
              matcher: ({ request }) => request.destination === 'document',
            },
          ],
        }
      : undefined,
  })

  serwist.addEventListeners()

  return serwist
}

export default setupServiceWorker
