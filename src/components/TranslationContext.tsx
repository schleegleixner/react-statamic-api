'use client'

import React, { ReactNode, useEffect } from 'react'
import {
  normalizeTranslations,
  setSiteId,
  setTranslations,
} from '../utils/translation'

export default function TranslationContext({
  children,
  strings,
  site_id,
}: {
  children: ReactNode
  strings: Array<{ key: string; value: string }>
  site_id?: string
}) {
  useEffect(() => {
    setTranslations(normalizeTranslations(strings))
    if (site_id) {
      setSiteId(site_id)
    }
  }, [strings, site_id])

  return <>{children}</>
}
