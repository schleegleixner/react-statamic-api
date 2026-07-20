var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import url from 'url';
import { readCache } from '../lib/cache';
import { fetchJSON, getCacheEndpoint } from '../utils/api';
import { readLocalStorage, removeLocalStorage, writeLocalStorage, } from '../utils/localstorage';
function handleRequest() {
    return __awaiter(this, arguments, void 0, function* (site_id = 'default', content_type = 'content', collection_id = 'tile', id = false) {
        const key = site_id + '.' + content_type + '.' + collection_id + '.' + id;
        let cache_data = readLocalStorage(key, site_id);
        if (!cache_data) {
            cache_data =
                (yield readCache(site_id, content_type, collection_id, id, false)) || null;
        }
        if (cache_data) {
            writeLocalStorage(key, cache_data, 15, site_id); // cache for 15 minutes
            return cache_data; // return the cached data
        }
        return null;
    });
}
export function getContent() {
    return __awaiter(this, arguments, void 0, function* (collection_id = 'tiles', id = false, site_id) {
        const singular_id = collection_id.endsWith('s')
            ? collection_id.slice(0, -1)
            : collection_id;
        return yield handleRequest(site_id, 'content', singular_id, id);
    });
}
export function getGlobal(global_id, site_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return handleRequest(site_id, 'global', global_id, false);
    });
}
export function getTaxonomy(taxonomy_id, site_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return handleRequest(site_id, 'taxonomy', taxonomy_id, false);
    });
}
export function getCollection() {
    return __awaiter(this, arguments, void 0, function* (collection_id = 'tiles', site_id) {
        return handleRequest(site_id, 'collection', collection_id, false);
    });
}
export function getPopulatedCollection() {
    return __awaiter(this, arguments, void 0, function* (collection_id = 'tiles', site_id) {
        const cache_data = (yield readCache(site_id, 'collection', `${collection_id}.populated`, false, false)) || null;
        if (cache_data) {
            return cache_data; // return the cached data
        }
        return null;
    });
}
export function getNavigation(handle, site_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const cache_data = (yield readCache(site_id, 'navigation', `${handle}.populated`, false, false)) || null;
        return cache_data;
    });
}
// request data from the cache (if available)
export function getCachedData(api) {
    return __awaiter(this, void 0, void 0, function* () {
        const api_endpoint = getCacheEndpoint(api);
        // server side rendering
        if (typeof window === 'undefined') {
            try {
                const parsedUrl = url.parse(api, true);
                const { collection, id } = parsedUrl.query;
                const response = (yield getContent(collection, id));
                return response || null;
            }
            catch (_a) {
                return null;
            }
        }
        // client request
        try {
            const response = (yield fetchJSON(api_endpoint));
            return response || null;
        }
        catch (_b) {
            return null;
        }
    });
}
export function getCompleteTileset() {
    return __awaiter(this, arguments, void 0, function* (site_id = 'default') {
        const collection = (yield getPopulatedCollection('tiles', site_id));
        const sources = (yield getPopulatedCollection('sources', site_id));
        if (!collection ||
            !sources ||
            collection.length === 0 ||
            sources.length === 0) {
            return [];
        }
        // enrich tiles with sources
        const updated_collection = collection.map(tile => {
            var _a;
            if ((_a = tile.content) === null || _a === void 0 ? void 0 : _a.datasources) {
                const enriched_datasources = tile.content.datasources.map(datasource => {
                    const source = sources.find(src => src.file_name === datasource.file_name);
                    return Object.assign(Object.assign({}, datasource), source);
                });
                return Object.assign(Object.assign({}, tile), { content: Object.assign(Object.assign({}, tile.content), { datasources: enriched_datasources }) });
            }
            return tile;
        });
        return updated_collection;
    });
}
export function getImageMeta(file_name_1, site_id_1) {
    return __awaiter(this, arguments, void 0, function* (file_name, site_id, use_cache = true) {
        const cache_key = 'collection.images';
        // check if the image is in the cache
        let images = use_cache
            ? readLocalStorage(cache_key, site_id)
            : null;
        let from_cache = !!images;
        // if the image is not in the cache, get it from the collection
        if (!images) {
            images = (yield getCollection('images', site_id));
            if (images) {
                writeLocalStorage(cache_key, images, 10, site_id); // cache for 10 minutes
            }
        }
        if (!images || images.length === 0) {
            return false;
        }
        let image = images.find((img) => img.file_name === file_name);
        // cache miss on a known-good file? cache might be stale, refetch once
        if (!image && from_cache) {
            removeLocalStorage(cache_key, site_id);
            const fresh = (yield getCollection('images', site_id));
            if (fresh && fresh.length > 0) {
                writeLocalStorage(cache_key, fresh, 10, site_id);
                image = fresh.find((img) => img.file_name === file_name);
            }
        }
        return image !== null && image !== void 0 ? image : false;
    });
}
