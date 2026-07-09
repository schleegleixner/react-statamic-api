/// <reference lib="webworker" />
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { defaultCache } from '@serwist/next/worker';
import { CacheFirst, ExpirationPlugin, NetworkFirst, Serwist } from 'serwist';
/**
 * Builds the runtime caching rules for a Statamic-API driven PWA:
 * live data (`/api/data`, `/api/cache`) and weather use NetworkFirst so the
 * last successful response stays available offline; static assets use
 * CacheFirst. Next.js defaults (`defaultCache`) handle navigation/RSC and the
 * `_next` output.
 */
export function createRuntimeCaching(options = {}) {
    const { liveDataMatcher = /\/api\/(data|cache)/, weatherHost = 'api.brightsky.dev', networkTimeoutSeconds = 10, extraRuntimeCaching = [], } = options;
    const custom = [
        {
            // Document navigations: keep the last successful HTML so previously
            // visited pages render on a cold offline start. Placed before the
            // Next.js defaults because their HTML matcher relies on a request
            // `Content-Type` header that navigations never send.
            matcher: ({ request, sameOrigin }) => sameOrigin && request.mode === 'navigate',
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
            matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/images/'),
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
    ];
    return [...extraRuntimeCaching, ...custom, ...defaultCache];
}
/**
 * One-call service worker bootstrap for consumer projects. A consumer's
 * `app/sw.ts` only needs `setupServiceWorker()`.
 */
export function setupServiceWorker(options = {}) {
    const { runtimeCaching, clientsClaim = true, skipWaiting = true, navigationPreload = true, offlineFallback = '/~offline' } = options, runtimeOptions = __rest(options, ["runtimeCaching", "clientsClaim", "skipWaiting", "navigationPreload", "offlineFallback"]);
    const serwist = new Serwist({
        precacheEntries: self.__SW_MANIFEST,
        skipWaiting,
        clientsClaim,
        navigationPreload,
        runtimeCaching: runtimeCaching !== null && runtimeCaching !== void 0 ? runtimeCaching : createRuntimeCaching(runtimeOptions),
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
    });
    serwist.addEventListeners();
    return serwist;
}
export default setupServiceWorker;
