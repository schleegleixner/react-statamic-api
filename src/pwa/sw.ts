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
    ...runtimeOptions
  } = options

  const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting,
    clientsClaim,
    navigationPreload,
    runtimeCaching: runtimeCaching ?? createRuntimeCaching(runtimeOptions),
  })

  serwist.addEventListeners()

  return serwist
}

export default setupServiceWorker
