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
import { ensureCacheFolder, moveTemporaryFolder, getCachePath, } from '../utils/filesystem';
import getDataFile from '../api/getDataFile';
import { getTimeline } from '../utils/sources';
import pLimit from 'p-limit';
import { sanitizeString } from '../utils/sanitize';
import { getFileContent } from '../response/responseContent';
const temporary_folder = 'temp';
function buildFullUrl(url, site_id = 'default') {
    if (!url) {
        return null;
    }
    if (url.startsWith('http')) {
        return url;
    }
    return `/${site_id !== 'default' ? site_id : ''}/${url}`.replace(/\/+/g, '/');
}
export function fetchFromStatamic(sites) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = [];
        const rebuild_results = yield rebuildCache(sites);
        const rebuild_success = rebuild_results.every(result => result.success === true);
        results.push({
            name: 'step::rebuild',
            success: rebuild_success,
            payload: rebuild_results,
        });
        const overall_success = results.every(step => step.success);
        const message = overall_success
            ? `Success! Cache has been flushed and rebuilt.`
            : `Some steps failed. Check the results for more information.`;
        const endpoint = getCMSEndpoint();
        return { message, endpoint, results, success: overall_success };
    });
}
function fetchFromRemote() {
    return __awaiter(this, arguments, void 0, function* (site_id = 'default', content_type = 'content', collection_id, id, options) {
        const base_url = getCMSEndpoint();
        const parts = [content_type, collection_id, id].filter(Boolean);
        const endpoint = `${base_url}${parts.join('/')}?site_id=${site_id}&secret=${process.env.API_SECRET}`;
        const payload = yield fetchJSON(endpoint, {
            silentNotFound: options === null || options === void 0 ? void 0 : options.silentNotFound,
        });
        if (!payload) {
            return null;
        }
        yield writeContentCache(temporary_folder, content_type, collection_id !== null && collection_id !== void 0 ? collection_id : undefined, id !== null && id !== void 0 ? id : undefined, payload);
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
function createPopulatedCollection(collection_id_1) {
    return __awaiter(this, arguments, void 0, function* (collection_id, site_id = 'default') {
        const json_data = getFileContent(temporary_folder, 'collection', collection_id, false);
        const collection = json_data === null || json_data === void 0 ? void 0 : json_data.payload;
        // const collection = await getCollection(collection_id, temporary_folder)
        if (!collection) {
            // eslint-disable-next-line no-console
            console.warn(`⚠️ Collection not found: ${collection_id} (${temporary_folder})`, collection);
            return null;
        }
        yield Promise.all(collection.map((entry) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            // url rewrites (add site_id in front)
            if (entry.url) {
                entry.site_id = site_id;
                entry.full_url = buildFullUrl(entry.url, site_id);
                if (entry.parent) {
                    entry.parent.full_url = buildFullUrl(entry.parent.url, site_id);
                }
            }
            // tiles
            if (entry.tile_id) {
                entry.content = yield ((_a = getFileContent(temporary_folder, 'content', 'tile', entry.tile_id)) === null || _a === void 0 ? void 0 : _a.payload);
                if (Array.isArray(entry.content.datasources)) {
                    entry.content.datasources.forEach((datasource) => {
                        // sanitize columns
                        if (Array.isArray(datasource.columns)) {
                            datasource.columns = datasource.columns.map((column) => sanitizeString(column));
                        }
                        // sanitize table_rows keys
                        if (Array.isArray(datasource.table_rows)) {
                            datasource.table_rows = datasource.table_rows.map((row) => (Object.assign(Object.assign({}, row), { key: sanitizeString(row.key) })));
                        }
                    });
                }
            }
            // pages
            if (collection_id === 'pages') {
                entry.content = yield ((_b = getFileContent(temporary_folder, 'content', 'page', entry.slug)) === null || _b === void 0 ? void 0 : _b.payload);
            }
            // sources
            if (entry.file_name) {
                const content = yield getDataFile(entry.file_name, temporary_folder);
                const timeline = getTimeline(content);
                entry.content = content;
                entry.timeline = timeline;
                entry.entry_count = (_c = timeline.length) !== null && _c !== void 0 ? _c : 0;
                entry.columns = (_d = entry.columns) === null || _d === void 0 ? void 0 : _d.map((column) => {
                    return sanitizeString(column);
                });
            }
        })));
        yield writeContentCache(temporary_folder, 'collection', `${collection_id}.populated`, false, collection);
        return collection;
    });
}
function createPopulatedNavigation(handle_1) {
    return __awaiter(this, arguments, void 0, function* (handle, site_id = 'default') {
        var _a, _b, _c;
        const json_data = getFileContent(temporary_folder, 'navigation', handle, false);
        const navigation = json_data === null || json_data === void 0 ? void 0 : json_data.payload;
        if (!navigation) {
            // eslint-disable-next-line no-console
            console.warn(`⚠️ Navigation not found: ${handle} (${temporary_folder})`);
            return null;
        }
        const pages_data = getFileContent(temporary_folder, 'collection', 'pages.populated', false);
        const pages = (_a = pages_data === null || pages_data === void 0 ? void 0 : pages_data.payload) !== null && _a !== void 0 ? _a : [];
        const pages_by_slug = new Map(pages.map(p => [p.slug, p]));
        const mapItem = (item) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            const page = item.entry
                ? pages_by_slug.get(item.entry)
                : item.slug
                    ? pages_by_slug.get(item.slug)
                    : undefined;
            const child_items = (_b = (_a = item.children) !== null && _a !== void 0 ? _a : item.items) !== null && _b !== void 0 ? _b : [];
            const is_external = (_d = (_c = item.url) === null || _c === void 0 ? void 0 : _c.startsWith('http')) !== null && _d !== void 0 ? _d : false;
            return {
                id: (_f = (_e = page === null || page === void 0 ? void 0 : page.id) !== null && _e !== void 0 ? _e : item.id) !== null && _f !== void 0 ? _f : null,
                slug: (_h = (_g = page === null || page === void 0 ? void 0 : page.slug) !== null && _g !== void 0 ? _g : item.slug) !== null && _h !== void 0 ? _h : null,
                title: (_k = (_j = item.title) !== null && _j !== void 0 ? _j : page === null || page === void 0 ? void 0 : page.title) !== null && _k !== void 0 ? _k : null,
                aria_label: (_o = (_m = (_l = item.aria_label) !== null && _l !== void 0 ? _l : item.title) !== null && _m !== void 0 ? _m : page === null || page === void 0 ? void 0 : page.title) !== null && _o !== void 0 ? _o : null,
                target: (_p = item.target) !== null && _p !== void 0 ? _p : (is_external ? '_blank' : '_self'),
                full_url: (_q = page === null || page === void 0 ? void 0 : page.full_url) !== null && _q !== void 0 ? _q : buildFullUrl(item.url, site_id),
                children: Array.isArray(child_items) ? child_items.map(mapItem) : [],
            };
        };
        const populated = {
            handle: (_b = navigation.handle) !== null && _b !== void 0 ? _b : handle,
            title: (_c = navigation.title) !== null && _c !== void 0 ? _c : null,
            items: Array.isArray(navigation.items) ? navigation.items.map(mapItem) : [],
        };
        yield writeContentCache(temporary_folder, 'navigation', `${handle}.populated`, false, populated);
        return populated;
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
        yield writeBuffer(getCachePath(temporary_folder, folder, file_name), content);
    });
}
// rebuild the cache for all sites
export function rebuildCache(sites) {
    return __awaiter(this, void 0, void 0, function* () {
        // if no sites are defined, use a default site
        if (!sites || sites.length === 0) {
            return [];
        }
        // eslint-disable-next-line no-console
        console.log('🔄 Rebuilding cache for sites:', sites);
        const results = yield Promise.all(sites.map((site) => __awaiter(this, void 0, void 0, function* () {
            const name = 'site::' + site;
            try {
                ensureCacheFolder(temporary_folder);
                const fetch_result = yield fetchForSite(site);
                // check if any step failed
                if (fetch_result.every(result => result.success === true)) {
                    yield moveTemporaryFolder(temporary_folder, site);
                    return { name, success: true, result: fetch_result };
                }
                return { name, success: false, result: fetch_result };
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.error(`❌ Error fetching site: ${site}`, e);
                return { name, success: false, result: e };
            }
        })));
        return results;
    });
}
// fetch all data for a specific site
function fetchForSite(site_id) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const collections = process.env.SET_COLLECTIONS
            ? process.env.SET_COLLECTIONS.split(',')
            : ['pages', 'sources', 'images', 'tiles'];
        const taxonomies = process.env.SET_TAXONOMIES
            ? process.env.SET_TAXONOMIES.split(',')
            : ['icons', 'action_fields', 'sdg_targets'];
        const global = process.env.SET_GLOBAL
            ? process.env.SET_GLOBAL.split(',')
            : ['seo', 'footer', 'strings'];
        const data = {};
        const results = [];
        const limit = pLimit(10); // limit concurrent requests
        const collection_results = yield Promise.all(collections.map(c => fetchFromRemote(site_id, 'collection', c)));
        collections.forEach((c, i) => (data[c] = collection_results[i]));
        const tasks_content = [];
        const tasks_files = [];
        let navigation_handles = [];
        ((_a = data.tiles) !== null && _a !== void 0 ? _a : []).forEach((tile) => tasks_content.push(limit(() => fetchContent(site_id, 'tile', tile.tile_id).then(r => results.push({ name: 'tile::' + tile.tile_id, success: !!r })))));
        ((_b = data.pages) !== null && _b !== void 0 ? _b : []).forEach((page) => tasks_content.push(limit(() => fetchContent(site_id, 'page', page.slug).then(r => results.push({ name: 'page::' + page.slug, success: !!r })))));
        taxonomies.forEach(t => tasks_content.push(limit(() => fetchFromRemote(site_id, 'taxonomy', t).then(r => results.push({ name: 'taxonomy::' + t, success: !!r })))));
        global.forEach(g => tasks_content.push(limit(() => fetchFromRemote(site_id, 'global', g).then(r => results.push({ name: 'global::' + g, success: !!r })))));
        tasks_content.push(limit(() => __awaiter(this, void 0, void 0, function* () {
            const list_payload = (yield fetchFromRemote(site_id, 'navigation', undefined, undefined, { silentNotFound: true }));
            // navigation list is optional (silentNotFound); a missing list must not
            // fail the rebuild and block moveTemporaryFolder from running
            results.push({ name: 'navigation::list', success: true });
            navigation_handles = (list_payload !== null && list_payload !== void 0 ? list_payload : []).map(({ handle }) => handle);
            yield Promise.all(navigation_handles.map(handle => limit(() => fetchFromRemote(site_id, 'navigation', handle, undefined, {
                silentNotFound: true,
            }).then(r => results.push({ name: 'navigation::' + handle, success: !!r })))));
        })));
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
            const result = yield createPopulatedCollection(c, site_id);
            results.push({
                name: 'populated_collection::' + c,
                success: result !== null,
            });
        }
        // eslint-disable-next-line no-console
        console.log(`ℹ️ Creating populated navigation: ${navigation_handles.length} (${site_id})`);
        for (const handle of navigation_handles) {
            // eslint-disable-next-line no-console
            console.log(`ℹ️ Creating populated navigation: ${handle} (${site_id})`);
            const result = yield createPopulatedNavigation(handle, site_id);
            results.push({
                name: 'populated_navigation::' + handle,
                success: result !== null,
            });
        }
        return results;
    });
}
