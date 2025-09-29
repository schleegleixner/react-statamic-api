var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fs from 'fs';
import path from 'path';
import { getCachedFilePath, getCacheRootPath } from '../utils/filesystem';
import { getCacheEndpoint } from '../utils/api';
// read the data from the cache
export function readCache() {
    return __awaiter(this, arguments, void 0, function* (site_id = 'default', content_type, folder = false, id = false, ignore_stale = false) {
        var _a;
        const endpoint = getCacheEndpoint('cache') +
            `?site_id=${site_id}&content_type=${content_type}&folder=${folder}&id=${id}&ignore_stale=${ignore_stale}`;
        try {
            const response = yield fetch(endpoint, { next: { tags: ['cached_data'] } });
            if (response.status !== 200) {
                // eslint-disable-next-line no-console
                console.error(`🚫 Cache read error at endpoint: ${endpoint} - Status: ${response.status}`);
            }
            const cache_data = yield response.text();
            const json_data = JSON.parse(cache_data);
            return (_a = json_data.payload) !== null && _a !== void 0 ? _a : json_data;
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error(`🚫 Error reading cache at endpoint: ${endpoint}`, error);
            // write a log entry about the error
            yield writeCache(getCachedFilePath('logs', content_type, folder, 'error.log'), {
                message: `Error reading cache at endpoint: ${endpoint}`,
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    });
}
export function readApiCache(file_name) {
    return __awaiter(this, void 0, void 0, function* () {
        // first try to read from the api cache
        const result = readCache('default', 'api', false, file_name);
        if (result) {
            return result;
        }
        // fallback to the alternative location
        return readCache('default', 'data', false, file_name);
    });
}
// write data to the cache
function writeCache(file_path_1, data_1) {
    return __awaiter(this, arguments, void 0, function* (file_path, data, lifetime = false) {
        const payload = {
            payload: data,
            expiry: false,
        };
        if (lifetime && typeof lifetime === 'number') {
            payload.expiry = Date.now() + lifetime * 60 * 1000;
        }
        yield writeFile(file_path, payload);
    });
}
// write content data to the cache
export function writeContentCache() {
    return __awaiter(this, arguments, void 0, function* (site_id = 'default', content_type, folder_path = false, id = false, data, lifetime = false) {
        yield writeCache(getCachedFilePath(site_id, content_type, folder_path, id), data, lifetime); // write the data to the cache
    });
}
// write API data to the cache
export function writeApiCache(file_name_1, data_1) {
    return __awaiter(this, arguments, void 0, function* (file_name, data, lifetime = 6 * 60) {
        writeContentCache('default', 'api', false, file_name, data, lifetime);
    });
}
// write data to a file
export function writeFile(file_path, data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // ensure the directory exists, create if it doesn't
            yield fs.promises.mkdir(path.dirname(file_path), { recursive: true });
            // convert data to string if it's not already
            const file_data = typeof data === 'string' ? data : JSON.stringify(data);
            // write data to the file
            yield fs.promises.writeFile(file_path, file_data, 'utf8');
            // eslint-disable-next-line no-console
            console.log('💾 File saved:', file_path.split('/cache/')[1]);
            return true;
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('🚫 Error saving file:', error);
            return false;
        }
    });
}
// write a buffer to a file
export function writeBuffer(file_path, buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            file_path = file_path.replace(/\/\//g, '/'); // remove double slashes from the path
            yield fs.promises.mkdir(path.dirname(file_path), { recursive: true });
            yield fs.promises.writeFile(file_path, buffer);
            // eslint-disable-next-line no-console
            console.log('💾 Buffer saved:', file_path.split('/cache/')[1]);
            return true;
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('🧨 Error writing buffer:', error);
            return false;
        }
    });
}
// clear the content cache
export function flushCache() {
    return __awaiter(this, void 0, void 0, function* () {
        const cache_root_path = getCacheRootPath();
        if (!fs.existsSync(cache_root_path)) {
            return true;
        }
        for (const lang_dir of fs.readdirSync(cache_root_path)) {
            const lang_path = path.join(cache_root_path, lang_dir);
            if (!fs.statSync(lang_path).isDirectory()) {
                continue;
            }
            for (const entry of fs.readdirSync(lang_path)) {
                if (entry === 'api') {
                    continue;
                }
                const entry_path = path.join(lang_path, entry);
                if (fs.statSync(entry_path).isDirectory()) {
                    fs.rmSync(entry_path, { recursive: true });
                    fs.mkdirSync(entry_path);
                }
                else {
                    fs.rmSync(entry_path);
                }
            }
        }
        return true;
    });
}
export function revalidateContent() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const endpoint = getCacheEndpoint('revalidate');
            const response = yield fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                return {
                    success: false,
                    error: `Failed to revalidate cache. Endpoint: ${endpoint} answered with status: ${response.status}`,
                };
            }
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    });
}
