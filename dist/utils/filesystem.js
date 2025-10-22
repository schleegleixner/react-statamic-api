var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'fs';
const cache_folder = 'cache';
const default_site_id = 'default';
export function getCacheRootPath(site_id) {
    return [process.cwd(), cache_folder, site_id].filter(Boolean).join('/');
}
export function ensureCacheFolder(site_id = 'default') {
    const cache_path = getCacheRootPath(site_id);
    if (!fs.existsSync(cache_path)) {
        fs.mkdirSync(cache_path, { recursive: true });
    }
    return cache_path;
}
export function moveTemporaryFolder(temporary_folder, site_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const temp_path = getCacheRootPath(temporary_folder);
        const site_path = getCacheRootPath(site_id);
        try {
            // remove existing site folder
            if (fs.existsSync(site_path)) {
                fs.rmSync(site_path, { recursive: true, force: true });
            }
            // create new destination folder
            fs.mkdirSync(site_path, { recursive: true });
            // copy everything from temp → site
            fs.cpSync(temp_path, site_path, { recursive: true, force: true });
            // nuke the temporary folder
            fs.rmSync(temp_path, { recursive: true, force: true });
            console.log(`💀 Moved and overwrote cache folder for site '${site_id}'`);
            return true;
        }
        catch (error) {
            console.error(`☠️  Failed to move folder '${temporary_folder}' → '${site_id}':`, error);
            return false;
        }
    });
}
export function getCachePath(site_id = null, content_type = 'content', folder = false, filename = false) {
    if (site_id === false) {
        site_id = null;
    }
    const path = [
        getCacheRootPath(site_id !== null && site_id !== void 0 ? site_id : default_site_id),
        content_type,
        folder,
        filename,
    ]
        .filter(Boolean)
        .join('/');
    return path;
}
export function getCachedFilePath(site_id = 'default', content_type = 'content', folder = false, id) {
    return getCachePath(site_id, content_type, id ? folder : false, `${id || folder || 'default'}.json`);
}
export function findDataFile(filename = false) {
    const folders = ['data', 'source'];
    // check if file exists in any of the paths
    for (const folder of folders) {
        const full_path = getCachePath(null, folder, filename);
        if (fs.existsSync(full_path)) {
            return full_path;
        }
    }
    return false;
}
