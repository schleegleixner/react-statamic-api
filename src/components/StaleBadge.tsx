'use client'

import React from 'react'

export interface StaleBadgeLabels {
  /** Prefix for the timestamp when data is fresh. Default: `Stand`. */
  updated?: string
  /** Text shown when data is outdated. Default: `veraltet`. */
  stale?: string
  /** Text shown when there is no timestamp. Default: `Offline-Daten`. */
  offline?: string
}

export interface StaleBadgeProps {
  /** When the shown data was fetched, in ms. */
  cached_at?: number | null
  /** Whether the data is considered outdated. */
  is_stale?: boolean
  /** BCP-47 locale for the timestamp. Default: `de-DE`. */
  locale?: string
  labels?: StaleBadgeLabels
  className?: string
}

/**
 * Small inline badge that communicates the freshness of live data. Themeable
 * via `className`; ships with Tailwind utility defaults but no hard color deps.
 */
export default function StaleBadge({
  cached_at,
  is_stale = false,
  locale = 'de-DE',
  labels,
  className,
}: StaleBadgeProps) {
  const merged_labels: Required<StaleBadgeLabels> = {
    updated: labels?.updated ?? 'Stand',
    stale: labels?.stale ?? 'Diese Daten sind möglicherweise veraltet',
    offline: labels?.offline ?? 'Offline-Daten',
  }

  const time_label =
    typeof cached_at === 'number'
      ? new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(cached_at))
      : null

  const base =
    'text-center items-center gap-1 rounded-full py-2 px-4 text-xs font-medium bg-amber-500 text-white'
  const tone = is_stale
    ? 'bg-amber-500 text-white'
    : 'bg-neutral-100 text-neutral-500'
  const class_name = [base, tone, className].filter(Boolean).join(' ')

  const text = is_stale
    ? time_label
      ? `${merged_labels.stale} · ${merged_labels.updated} ${time_label} Uhr`
      : merged_labels.offline
    : time_label
      ? `${merged_labels.updated} ${time_label}`
      : merged_labels.updated

  return (
    <span className={class_name} title={text}>
      {text}
    </span>
  )
}