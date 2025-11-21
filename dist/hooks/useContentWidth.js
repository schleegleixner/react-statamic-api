'use client';
import { useEffect, useRef, useState } from 'react';
export default function useContentWidth() {
    const el_ref = useRef(null);
    const [content_width, setContentWidth] = useState(0);
    useEffect(() => {
        const el = el_ref.current;
        if (!el) {
            return;
        }
        setContentWidth(el.clientWidth);
        const ro = new ResizeObserver(([entry]) => setContentWidth(Math.round(entry.contentRect.width)));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    // type assertion to ensure the returned ref has the correct type
    return { el_ref: el_ref, content_width };
}
