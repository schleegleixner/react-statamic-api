let active_translations = {};
let active_site_id = '';
export const setTranslations = (translations) => {
    active_translations = translations || {};
};
export const setSiteId = (site_id) => {
    active_site_id = site_id || '';
};
export const getGlobalString = (key, fallback) => {
    if (Object.keys(active_translations).length === 0 ||
        !(key in active_translations)) {
        return fallback || `[${key}]`;
    }
    return active_translations[key];
};
export const getSiteId = () => {
    return active_site_id;
};
export const normalizeTranslations = (entries) => {
    if (!entries || entries.length === 0) {
        return {};
    }
    return entries.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
    }, {});
};
