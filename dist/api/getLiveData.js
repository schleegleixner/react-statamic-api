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
import { readLocalStorage, writeLocalStorage } from '../utils/localstorage';
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
