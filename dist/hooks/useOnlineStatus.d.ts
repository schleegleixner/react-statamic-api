/**
 * Reactive online/offline flag based on `navigator.onLine` and the
 * `online`/`offline` window events. SSR-safe (starts optimistic as `true`).
 */
export default function useOnlineStatus(): boolean;
