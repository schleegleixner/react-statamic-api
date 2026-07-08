'use client';
import { useEffect, useState } from 'react';
/**
 * Reactive online/offline flag based on `navigator.onLine` and the
 * `online`/`offline` window events. SSR-safe (starts optimistic as `true`).
 */
export default function useOnlineStatus() {
    const [is_online, setIsOnline] = useState(true);
    useEffect(() => {
        const update = () => setIsOnline(navigator.onLine);
        update();
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
        return () => {
            window.removeEventListener('online', update);
            window.removeEventListener('offline', update);
        };
    }, []);
    return is_online;
}
