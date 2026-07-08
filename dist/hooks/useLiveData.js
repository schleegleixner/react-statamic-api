'use client';
import { useEffect, useRef, useState } from 'react';
import { getLiveDataWithMeta } from '../api';
import useOnlineStatus from './useOnlineStatus';
/**
 * Drop-in replacement for `useApi` that additionally surfaces staleness so the
 * UI can flag live data as outdated when running offline or from an expired
 * cache. Reuses the same localStorage cache as `useApi`.
 */
export default function useLiveData(route, lifetime = 30, auto_update = true) {
    const [data, setData] = useState(null);
    const [status, setStatus] = useState('idle');
    const [cachedAt, setCachedAt] = useState(null);
    const [expires, setExpires] = useState(null);
    const [now, setNow] = useState(() => Date.now());
    const isFetching = useRef(false);
    const isOnline = useOnlineStatus();
    useEffect(() => {
        const fetchData = () => {
            if (isFetching.current) {
                return;
            }
            isFetching.current = true;
            setStatus('loading');
            getLiveDataWithMeta(route, lifetime)
                .then(result => {
                if (result.data !== null && result.data !== undefined) {
                    setData(result.data);
                    setCachedAt(result.cached_at);
                    setExpires(result.expires);
                    setStatus('success');
                }
                else {
                    setData(null);
                    setStatus('error');
                }
            })
                .catch(() => {
                setData(null);
                setStatus('error');
            })
                .finally(() => {
                isFetching.current = false;
            });
        };
        fetchData();
        if (auto_update && lifetime > 0) {
            const interval = setInterval(fetchData, lifetime * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [route, lifetime, auto_update]);
    // Re-evaluate staleness over time without refetching.
    useEffect(() => {
        const tick = setInterval(() => setNow(Date.now()), 30 * 1000);
        return () => clearInterval(tick);
    }, []);
    const is_stale = status === 'success' && (!isOnline || (expires !== null && now > expires));
    return {
        data,
        status,
        cached_at: cachedAt,
        expires,
        is_stale,
        is_online: isOnline,
    };
}
