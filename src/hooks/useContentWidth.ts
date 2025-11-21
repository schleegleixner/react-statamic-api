'use client'

import { RefObject, useEffect, useRef, useState } from 'react'

export default function useContentWidth<
  T extends HTMLElement = HTMLDivElement,
>() {
  const el_ref = useRef<T | null>(null)
  const [content_width, setContentWidth] = useState(0)

  useEffect(() => {
    const el = el_ref.current
    if (!el) {
      return
    }

    setContentWidth(el.clientWidth)

    const ro = new ResizeObserver(([entry]) =>
      setContentWidth(Math.round(entry.contentRect.width)),
    )
    ro.observe(el)

    return () => ro.disconnect()
  }, [])

  // type assertion to ensure the returned ref has the correct type
  return { el_ref: el_ref as RefObject<T>, content_width }
}
