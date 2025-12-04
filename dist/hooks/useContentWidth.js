'use client';
import { useEffect, useRef, useState } from 'react';
export default function useContentWidth() {
    const elRef = useRef(null);
    const [contentWidth, setContentWidth] = useState(0);
    useEffect(() => {
        const el = elRef.current;
        if (!el) {
            return;
        }
        const updateWidth = () => {
            setContentWidth(Math.round(el.clientWidth));
        };
        // Set initial width
        updateWidth();
        const resizeObserver = new ResizeObserver(() => {
            updateWidth();
        });
        resizeObserver.observe(el);
        return () => {
            resizeObserver.disconnect();
        };
    }, []);
    return { elRef, contentWidth };
}
