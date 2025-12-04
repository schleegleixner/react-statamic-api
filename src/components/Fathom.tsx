'use client'

import React, { Suspense, useEffect } from 'react'
import { load, trackPageview } from 'fathom-client'
import { usePathname, useSearchParams } from 'next/navigation'

function TrackPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fathom_id = process.env.NEXT_PUBLIC_FATHOM_ID
    if (typeof fathom_id === 'string' && fathom_id.length > 0) {
      load(fathom_id, {
        auto: false,
      })
    }
  }, [])

  useEffect(() => {
    if (!pathname) {
      return
    }

    trackPageview({
      url: pathname + searchParams?.toString(),
      referrer: document.referrer,
    })
  }, [pathname, searchParams])

  return null
}

export default function FathomAnalytics() {
  return (
    <Suspense fallback={null}>
      <TrackPageView />
    </Suspense>
  )
}
