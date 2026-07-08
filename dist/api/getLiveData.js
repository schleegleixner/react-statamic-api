var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getCachedData } from '../lib/content';
import { readLocalStorage, readLocalStorageWithMeta, writeLocalStorage, } from '../utils/localstorage';
/**
 * Like `getLiveData`, but returns cache metadata and, when the network fails,
 * falls back to expired local cache instead of returning nothing. Powers the
 * "stale" detection in `useLiveData`.
 */
export function getLiveDataWithMeta(route_1) {
    return __awaiter(this, arguments, void 0, function* (route, lifetime = 30) {
        const cache_key = `sdd_api_cache_${route}`;
        const cached = readLocalStorageWithMeta(cache_key);
        if (cached && !cached.is_expired) {
            return {
                data: cached.data,
                cached_at: cached.written,
                expires: cached.expires,
                from_cache: true,
            };
        }
        try {
            const data = yield getCachedData(`data?route=${route}&lifetime=${lifetime}`);
            if (data !== null && data !== '') {
                writeLocalStorage(cache_key, data, lifetime);
                const now = Date.now();
                return {
                    data: data,
                    cached_at: now,
                    expires: now + lifetime * 60 * 1000,
                    from_cache: false,
                };
            }
        }
        catch (_a) {
            // fall through to stale cache below
        }
        // Offline or empty response: serve stale cache if we have any.
        if (cached) {
            return {
                data: cached.data,
                cached_at: cached.written,
                expires: cached.expires,
                from_cache: true,
            };
        }
        return { data: null, cached_at: null, expires: null, from_cache: false };
    });
}
export default function getLiveData(route_1) {
    return __awaiter(this, arguments, void 0, function* (route, lifetime = 30, default_value = '', use_local_storage = true) {
        const cache_key = `sdd_api_cache_${route}`;
        // check for cached data in localStorage
        if (use_local_storage) {
            const data = readLocalStorage(cache_key);
            if (data) {
                return data;
            }
        }
        try {
            const data = yield getCachedData(`data?route=${route}&lifetime=${lifetime}`);
            if (data !== null && data !== '') {
                if (use_local_storage) {
                    writeLocalStorage(cache_key, data, lifetime);
                }
                return data;
            }
        }
        catch (error) {
            throw new Error(`Failed to fetch data: ${error instanceof Error ? error.message : String(error)}`);
        }
        return default_value;
    });
}
