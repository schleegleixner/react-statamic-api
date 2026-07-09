/**
 * Reactive online/offline flag. Combines `navigator.onLine` with an active
 * connectivity probe, because `navigator.onLine` only reflects a network
 * interface, not real reachability (e.g. a PWA served from the service worker
 * cache, captive portals, or DevTools service-worker offline emulation all
 * leave it `true`). The probe uses a unique cache-busting query so it always
 * hits the network and bypasses any NetworkFirst service-worker cache; a failed
 * request means we are effectively offline. SSR-safe (starts optimistic).
 */
export default function useOnlineStatus(): boolean;
