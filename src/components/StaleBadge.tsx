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
    stale: labels?.stale ?? 'veraltet',
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
    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium'
  const tone = is_stale
    ? 'bg-amber-100 text-amber-800'
    : 'bg-neutral-100 text-neutral-500'
  const class_name = [base, tone, className].filter(Boolean).join(' ')

  const text = is_stale
    ? time_label
      ? `${merged_labels.stale} · ${merged_labels.updated} ${time_label}`
      : merged_labels.offline
    : time_label
      ? `${merged_labels.updated} ${time_label}`
      : merged_labels.updated

  return (
    <span className={class_name} title={text}>
      {is_stale ? (
        <svg
          aria-hidden="true"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      {text}
    </span>
  )
}
