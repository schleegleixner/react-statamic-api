import React from 'react';
export interface StaleBadgeLabels {
    /** Prefix for the timestamp when data is fresh. Default: `Stand`. */
    updated?: string;
    /** Text shown when data is outdated. Default: `veraltet`. */
    stale?: string;
    /** Text shown when there is no timestamp. Default: `Offline-Daten`. */
    offline?: string;
}
export interface StaleBadgeProps {
    /** When the shown data was fetched, in ms. */
    cached_at?: number | null;
    /** Whether the data is considered outdated. */
    is_stale?: boolean;
    /** BCP-47 locale for the timestamp. Default: `de-DE`. */
    locale?: string;
    labels?: StaleBadgeLabels;
    className?: string;
}
/**
 * Small inline badge that communicates the freshness of live data. Themeable
 * via `className`; ships with Tailwind utility defaults but no hard color deps.
 */
export default function StaleBadge({ cached_at, is_stale, locale, labels, className, }: StaleBadgeProps): React.JSX.Element;
