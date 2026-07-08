/**
 * Reactive flag indicating whether the app runs as an installed PWA
 * (standalone display mode). Covers the standard `display-mode: standalone`
 * media query plus the iOS Safari `navigator.standalone` fallback.
 * SSR-safe (starts as `false`).
 */
export default function useIsPwa(): boolean;
