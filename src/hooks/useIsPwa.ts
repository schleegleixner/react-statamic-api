'use client'

import { useEffect, useState } from 'react'

/**
 * Reactive flag indicating whether the app runs as an installed PWA
 * (standalone display mode). Covers the standard `display-mode: standalone`
 * media query plus the iOS Safari `navigator.standalone` fallback.
 * SSR-safe (starts as `false`).
 */
export default function useIsPwa(): boolean {
  const [is_pwa, setIsPwa] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(display-mode: standalone)')
    const update = () =>
      setIsPwa(
        mql.matches ||
          (window.navigator as { standalone?: boolean }).standalone === true,
      )
    update()

    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  return is_pwa
}
