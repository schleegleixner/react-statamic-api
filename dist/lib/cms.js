var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { readApiCache, writeApiCache, writeBuffer, writeContentCache, } from '../lib/cache';
import { fetchFile, fetchJSON, getCMSEndpoint } from '../utils/api';
import path from 'path';
import { getCachePath } from '../utils/filesystem';
import getDataFile from '../api/getDataFile';
import { getTimeline } from '../utils/sources';
import { getCollection, getContent } from '../lib/content';
import { flushCache, revalidateContent } from './cache';
import pLimit from 'p-limit';
export function fetchFromStatamic(sites) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = [];
        const flushResult = yield flushCache(sites);
        results.push({ name: 'flush', success: flushResult === true });
        const rebuildResult = yield rebuildCache(sites);
        results.push({
            name: 'rebuild',
            success: rebuildResult !== false,
            payload: rebuildResult,
        });
        const revalidationResult = yield revalidateContent();
        if (!revalidationResult.success) {
            results.push({
                name: 'revalidation',
                success: false,
                error: revalidationResult.error,
            });
        }
        else {
            results.push({ name: 'revalidation', success: true });
        }
        const overallSuccess = results.every(step => step.success);
        const message = overallSuccess
            ? 'Success! Cache has been flushed and rebuilt.'
            : 'Some steps failed. Check the results for more information.';
        return { message, results, success: overallSuccess };
    });
}
function fetchFromRemote() {
    return __awaiter(this, arguments, void 0, function* (site_id = 'default', content_type = 'content', collection_id, id) {
        const base_url = getCMSEndpoint();
        const parts = [content_type, collection_id, id].filter(Boolean);
        const endpoint = `${base_url}${parts.join('/')}?site_id=${site_id}`;
        const payload = yield fetchJSON(endpoint);
        if (!payload) {
            return null;
        }
        yield writeContentCache(site_id, content_type, collection_id !== null && collection_id !== void 0 ? collection_id : undefined, id !== null && id !== void 0 ? id : undefined, payload);
        return payload;
    });
}
function fetchContent() {
    return __awaiter(this, arguments, void 0, function* (site_id = 'default', collection_id, id) {
        const singular_id = collection_id.endsWith('s')
            ? collection_id.slice(0, -1)
            : collection_id;
        return yield fetchFromRemote(site_id, 'content', singular_id, id);
    });
}
function createPopulatedCollection() {
    return __awaiter(this, arguments, void 0, function* (site_id = 'default', collection_id) {
        const collection = yield getCollection(collection_id, site_id);
        if (!collection) {
            // eslint-disable-next-line no-console
            console.warn(`⚠️ Collection not found: ${collection_id} (${site_id})`, collection);
            return null;
        }
        yield Promise.all(collection.map((entry) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            // url rewrites (add site_id in front)
            if (entry.url) {
                entry.site_id = site_id;
                // only apply if not starting with http
                if (!entry.url.startsWith('http')) {
                    entry.full_url =
                        `/${site_id !== 'default' ? site_id : ''}/${entry.url}`.replace(/\/+/g, '/');
                }
                if (entry.parent) {
                    entry.parent.full_url =
                        `/${site_id !== 'default' ? site_id : ''}/${entry.parent.url}`.replace(/\/+/g, '/');
                }
            }
            // tiles
            if (entry.tile_id) {
                entry.content = yield getContent(collection_id, entry.tile_id, site_id);
            }
            // pages
            if (collection_id === 'pages') {
                console.log('📄 Fetching page content for', entry.slug);
                entry.content = yield getContent('pages', entry.slug, site_id);
            }
            // sources
            if (entry.file_name) {
                const content = yield getDataFile(entry.file_name);
                const timeline = getTimeline(content);
                entry.content = content;
                entry.timeline = timeline;
                entry.entry_count = (_a = timeline.length) !== null && _a !== void 0 ? _a : 0;
            }
        })));
        yield writeContentCache(site_id, 'collection', `${collection_id}.populated`, false, collection);
        return collection;
    });
}
export function getAPI(api_1) {
    return __awaiter(this, arguments, void 0, function* (api, use_cache = true, lifetime = 6 * 60) {
        const file_name = api.replace(/\//g, '_');
        if (use_cache) {
            const cache_data = (yield readApiCache(file_name)) || null;
            if (cache_data) {
                return cache_data;
            }
        }
        // get the data from the API
        const endpoint = `${getCMSEndpoint()}${api}`;
        const payload = yield fetchJSON(endpoint);
        if (payload !== null) {
            // save the data to the cache
            writeApiCache(file_name, payload, lifetime);
            return payload;
        }
        return null;
    });
}
function downloadFile(site_id, file_path, folder) {
    return __awaiter(this, void 0, void 0, function* () {
        // if endpoint has no http(s):// prefix, prepend the CMS endpoint
        const endpoint = file_path.startsWith('http')
            ? file_path
            : getCMSEndpoint(path.join(folder, file_path));
        const file_name = file_path.startsWith('http')
            ? path.basename(file_path)
            : file_path;
        const content = yield fetchFile(endpoint);
        if (!content) {
            return false;
        }
        yield writeBuffer(getCachePath(site_id, folder, file_name), content);
    });
}
// rebuild the cache for all sites
export function rebuildCache(sites) {
    return __awaiter(this, void 0, void 0, function* () {
        // if no sites are defined, use a default site
        if (!sites || sites.length === 0) {
            return false;
        }
        const results = yield Promise.all(sites.map((site) => __awaiter(this, void 0, void 0, function* () {
            try {
                const fetch_result = yield fetchForSite(site);
                return { site_id: site, result: fetch_result };
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.error(`❌ Error fetching site: ${site}`, e);
                return { name: 'site::' + site, success: false, error: e };
            }
        })));
        return results;
    });
}
// fetch all data for a specific site
function fetchForSite(site_id) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const collections = ['pages', 'sources', 'images', 'tiles'];
        const taxonomies = ['icons', 'action_fields', 'sdg_targets'];
        const global = ['seo', 'footer', 'strings'];
        const data = {};
        const results = [];
        const limit = pLimit(10); // limit concurrent requests
        const collection_results = yield Promise.all(collections.map(c => fetchFromRemote(site_id, 'collection', c)));
        collections.forEach((c, i) => (data[c] = collection_results[i]));
        const tasks_content = [];
        const tasks_files = [];
        ((_a = data.tiles) !== null && _a !== void 0 ? _a : []).forEach((tile) => tasks_content.push(limit(() => fetchContent(site_id, 'tile', tile.tile_id).then(r => results.push({ name: 'tile::' + tile.tile_id, success: !!r })))));
        ((_b = data.pages) !== null && _b !== void 0 ? _b : []).forEach((page) => tasks_content.push(limit(() => fetchContent(site_id, 'page', page.slug).then(r => results.push({ name: 'page::' + page.slug, success: !!r })))));
        taxonomies.forEach(t => tasks_content.push(limit(() => fetchFromRemote(site_id, 'taxonomy', t).then(r => results.push({ name: 'taxonomy::' + t, success: !!r })))));
        global.forEach(g => tasks_content.push(limit(() => fetchFromRemote(site_id, 'global', g).then(r => results.push({ name: 'global::' + g, success: !!r })))));
        ((_c = data.images) !== null && _c !== void 0 ? _c : []).forEach((image) => tasks_files.push(limit(() => downloadFile(site_id, image.url, 'images').then(r => results.push({
            name: 'image::' + image.file_name,
            success: r !== null,
        })))));
        ((_d = data.sources) !== null && _d !== void 0 ? _d : []).forEach((source) => tasks_files.push(limit(() => downloadFile(site_id, source.url, 'source').then(r => results.push({
            name: 'source::' + source.file_name,
            success: r !== null,
        })))));
        // eslint-disable-next-line no-console
        console.log(`ℹ️ Fetching content for site: ${site_id}, tasks: ${tasks_content.length}`);
        yield Promise.all(tasks_content);
        // eslint-disable-next-line no-console
        console.log(`ℹ️ Fetching files for site: ${site_id}, tasks: ${tasks_files.length}`);
        yield Promise.all(tasks_files);
        // eslint-disable-next-line no-console
        console.log(`ℹ️ Fetched ${results.length} items for site: ${site_id}`);
        for (const c of collections) {
            // eslint-disable-next-line no-console
            console.log(`ℹ️ Creating populated collection: ${c} (${site_id})`);
            yield createPopulatedCollection(site_id, c);
        }
        return results;
    });
}
