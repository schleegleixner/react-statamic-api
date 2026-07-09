'use client';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useEffect, useState } from 'react';
/**
 * Reactive online/offline flag. Combines `navigator.onLine` with an active
 * connectivity probe, because `navigator.onLine` only reflects a network
 * interface, not real reachability (e.g. a PWA served from the service worker
 * cache, captive portals, or DevTools service-worker offline emulation all
 * leave it `true`). The probe uses a unique cache-busting query so it always
 * hits the network and bypasses any NetworkFirst service-worker cache; a failed
 * request means we are effectively offline. SSR-safe (starts optimistic).
 */
export default function useOnlineStatus() {
    const [is_online, setIsOnline] = useState(true);
    useEffect(() => {
        let cancelled = false;
        const probe = () => __awaiter(this, void 0, void 0, function* () {
            if (!navigator.onLine) {
                if (!cancelled)
                    setIsOnline(false);
                return;
            }
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            try {
                yield fetch(`/manifest.webmanifest?__rsa_ping=${Date.now()}`, {
                    method: 'GET',
                    cache: 'no-store',
                    signal: controller.signal,
                });
                if (!cancelled)
                    setIsOnline(true);
            }
            catch (_a) {
                if (!cancelled)
                    setIsOnline(false);
            }
            finally {
                clearTimeout(timeout);
            }
        });
        const goOffline = () => setIsOnline(false);
        probe();
        window.addEventListener('online', probe);
        window.addEventListener('offline', goOffline);
        return () => {
            cancelled = true;
            window.removeEventListener('online', probe);
            window.removeEventListener('offline', goOffline);
        };
    }, []);
    return is_online;
}
