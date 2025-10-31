var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getContent } from '../lib';
import { replaceContentTags } from './sanitize';
export function findPageByIdOrSlug(sitemap, identifier) {
    if (!sitemap || !identifier) {
        return null;
    }
    // test if identifier is a full URL (starts with /)
    for (const entry of sitemap) {
        if (entry.full_url === identifier) {
            return entry;
        }
    }
    const found = sitemap.find(entry => entry.id === identifier ||
        entry.slug === identifier ||
        entry.url === identifier ||
        entry.full_url === identifier ||
        entry.full_url === identifier + '/');
    return found !== null && found !== void 0 ? found : null;
}
export function getCurrentPageServer(sitemap_1, pathname_1) {
    return __awaiter(this, arguments, void 0, function* (sitemap, pathname, enforce_matching_url = false) {
        var _a;
        let page_data;
        // mage sure pathname starts with a slash
        if (typeof pathname !== 'string' || !pathname.startsWith('/')) {
            return page_data !== null && page_data !== void 0 ? page_data : undefined;
        }
        const segments = pathname.split('/').filter(Boolean);
        const path = '/' + segments.join('/');
        const path_parent = '/' + segments.slice(0, -1).join('/');
        if (segments.length) {
            // fetch the current page based on the last or second last segment
            page_data =
                (_a = findPageByIdOrSlug(sitemap, path)) !== null && _a !== void 0 ? _a : findPageByIdOrSlug(sitemap, path_parent);
        }
        else {
            // is start page
            page_data = findPageByIdOrSlug(sitemap, 'home');
        }
        // if enforce_matching_url is true, the pathname must match the page's full_url (no mounted slugs)
        if (enforce_matching_url &&
            page_data &&
            path !== '/' &&
            path !== page_data.full_url.replace(/\/$/, '')) {
            return undefined;
        }
        return page_data !== null && page_data !== void 0 ? page_data : undefined;
    });
}
export function getPageTitleServer(pathname_1, site_id_1, page_1, seo_title_1) {
    return __awaiter(this, arguments, void 0, function* (pathname, site_id, page, seo_title, divider = ' | ', default_page_title = '404 - Seite nicht gefunden') {
        var _a, _b, _c;
        const segments = pathname.split('/').filter(Boolean);
        const last_segment = segments.length ? segments[segments.length - 1] : null;
        // check for specific page slugs and return tile name if available
        if (page && page.slug !== last_segment && last_segment !== site_id) {
            // check if the last segment is a tile id
            if (last_segment) {
                const tile_content = yield getContent('tile', last_segment, site_id);
                if (tile_content) {
                    const tile_title = getTileTitle(tile_content);
                    return getPageTitle(tile_title + divider + (page === null || page === void 0 ? void 0 : page.title), seo_title);
                }
            }
        }
        return getPageTitle((_c = (_b = (_a = page === null || page === void 0 ? void 0 : page.content) === null || _a === void 0 ? void 0 : _a.seo_title) !== null && _b !== void 0 ? _b : page === null || page === void 0 ? void 0 : page.title) !== null && _c !== void 0 ? _c : default_page_title, seo_title);
    });
}
export function getPageTitle(title, seo_title) {
    return __awaiter(this, void 0, void 0, function* () {
        return `${title} | ${seo_title !== null && seo_title !== void 0 ? seo_title : ''}`;
    });
}
export function setPageTitle(title, seo_title) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof document !== 'undefined') {
            document.title = yield getPageTitle(title, seo_title);
            return true;
        }
        return false;
    });
}
export function getTileTitle(tile) {
    if (!tile || typeof tile.title !== 'string') {
        return '';
    }
    return replaceContentTags(tile.title);
}
