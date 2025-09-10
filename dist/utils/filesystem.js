import fs from 'fs';
const cache_folder = 'cache';
const default_language = 'default';
const translated_content_types = ['collection', 'content', 'global'];
export function getCacheRootPath() {
    return [process.cwd(), cache_folder].filter(Boolean).join('/');
}
export function getCachePath(language = null, content_type = 'content', folder = false, filename = false) {
    // if the content type is not translated, use the default language
    if (content_type && !translated_content_types.includes(content_type)) {
        language = null;
    }
    const path = [
        getCacheRootPath(),
        language !== null && language !== void 0 ? language : default_language,
        content_type,
        folder,
        filename,
    ]
        .filter(Boolean)
        .join('/');
    return path;
}
export function getCachedFilePath(content_type = 'content', folder = false, id) {
    const current_language = null; // TBD
    return getCachePath(current_language, content_type, id ? folder : false, `${id || folder || 'default'}.json`);
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
