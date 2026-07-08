'use client';
import React from 'react';
/**
 * Small inline badge that communicates the freshness of live data. Themeable
 * via `className`; ships with Tailwind utility defaults but no hard color deps.
 */
export default function StaleBadge({ cached_at, is_stale = false, locale = 'de-DE', labels, className, }) {
    var _a, _b, _c;
    const merged_labels = {
        updated: (_a = labels === null || labels === void 0 ? void 0 : labels.updated) !== null && _a !== void 0 ? _a : 'Stand',
        stale: (_b = labels === null || labels === void 0 ? void 0 : labels.stale) !== null && _b !== void 0 ? _b : 'Diese Daten sind möglicherweise veraltet',
        offline: (_c = labels === null || labels === void 0 ? void 0 : labels.offline) !== null && _c !== void 0 ? _c : 'Offline-Daten',
    };
    const time_label = typeof cached_at === 'number'
        ? new Intl.DateTimeFormat(locale, {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(cached_at))
        : null;
    const base = 'text-center items-center gap-1 rounded-full py-2 px-4 text-xs font-medium bg-amber-500 text-white';
    const tone = is_stale
        ? 'bg-amber-100 text-amber-800'
        : 'bg-neutral-100 text-neutral-500';
    const class_name = [base, tone, className].filter(Boolean).join(' ');
    const text = is_stale
        ? time_label
            ? `${merged_labels.stale} · ${merged_labels.updated} ${time_label} Uhr`
            : merged_labels.offline
        : time_label
            ? `${merged_labels.updated} ${time_label}`
            : merged_labels.updated;
    return (React.createElement("span", { className: class_name, title: text }, text));
}
