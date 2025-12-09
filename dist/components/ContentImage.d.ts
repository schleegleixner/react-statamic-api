import React from 'react';
export default function ContentImage({ src, site_id, alt, width, height, className, loading, sizes, default_breakpoints, }: {
    src: string;
    alt?: string | null;
    site_id?: string;
    width?: number | null;
    height?: number | null;
    className?: string;
    loading?: 'lazy' | 'eager';
    sizes?: number[];
    default_breakpoints?: string;
}): React.JSX.Element;
