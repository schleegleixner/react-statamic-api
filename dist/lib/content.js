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
import { readLocalStorage, writeLocalStorage } from '../utils/localstorage';
function handleRequest() {
    return __awaiter(this, arguments, void 0, function* (content_type = 'content', collection_id = 'tile', id = false) {
        const key = content_type + '.' + collection_id + '.' + id;
        let cache_data = readLocalStorage(key);
        if (!cache_data) {
            cache_data = (yield readCache(content_type, collection_id, id)) || null;
        }
        if (cache_data) {
            writeLocalStorage(key, cache_data, 15); // cache for 15 minutes
            return cache_data; // return the cached data
        }
        return null;
    });
}
export function getContent() {
    return __awaiter(this, arguments, void 0, function* (collection_id = 'tiles', id = false) {
        const singular_id = collection_id.endsWith('s')
            ? collection_id.slice(0, -1)
            : collection_id;
        return yield handleRequest('content', singular_id, id);
    });
}
export function getGlobal(global_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return handleRequest('global', global_id);
    });
}
export function getTaxonomy(taxonomy_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return handleRequest('taxonomy', taxonomy_id);
    });
}
export function getCollection() {
    return __awaiter(this, arguments, void 0, function* (collection_id = 'tiles') {
        return handleRequest('collection', collection_id);
    });
}
export function getPopulatedCollection() {
    return __awaiter(this, arguments, void 0, function* (collection_id = 'tiles') {
        const cache_data = (yield readCache('collection', `${collection_id}.populated`)) || null;
        if (cache_data) {
            return cache_data; // return the cached data
        }
        return null;
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
    return __awaiter(this, void 0, void 0, function* () {
        const collection = (yield getPopulatedCollection('tiles'));
        const sources = (yield getPopulatedCollection('sources'));
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
export function getImageMeta(file_name) {
    return __awaiter(this, void 0, void 0, function* () {
        let images = readLocalStorage('collection.images');
        if (!images) {
            images = (yield getCollection('images'));
            if (images) {
                writeLocalStorage('collection.images', images, 60); // cache for 1 hour
            }
        }
        if (!images || images.length === 0) {
            return false;
        }
        const image = images.find((img) => img.file_name === file_name);
        return image !== null && image !== void 0 ? image : false;
    });
}
