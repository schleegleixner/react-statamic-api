export function getAppVersion() {
    var _a;
    return ((typeof process !== 'undefined' && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.NEXT_PUBLIC_APP_VERSION)) ||
        '1.0');
}
export function readLocalStorage(key, site_id = 'default') {
    if (site_id === 'preview') {
        return null; // preview mode does not use localStorage
    }
    const versioned_key = key + '_' + getAppVersion() + '_' + site_id;
    try {
        const raw = localStorage.getItem(versioned_key);
        if (!raw) {
            return null;
        }
        const { expires, data } = JSON.parse(raw);
        if (Date.now() > expires) {
            localStorage.removeItem(versioned_key);
            return null;
        }
        return data;
    }
    catch (_a) {
        return null;
    }
}
/**
 * Like `readLocalStorage` but returns cache metadata and, crucially, does NOT
 * delete expired entries. This lets callers (e.g. `useLiveData`) keep showing
 * the last known value offline while flagging it as stale.
 */
export function readLocalStorageWithMeta(key, site_id = 'default') {
    if (site_id === 'preview') {
        return null;
    }
    const versioned_key = key + '_' + getAppVersion() + '_' + site_id;
    try {
        const raw = localStorage.getItem(versioned_key);
        if (!raw) {
            return null;
        }
        const { expires, data, written } = JSON.parse(raw);
        return {
            data,
            expires,
            written: typeof written === 'number' ? written : null,
            is_expired: Date.now() > expires,
        };
    }
    catch (_a) {
        return null;
    }
}
export function removeLocalStorage(key, site_id = 'default') {
    if (site_id === 'preview') {
        return false;
    }
    const versioned_key = key + '_' + getAppVersion() + '_' + site_id;
    try {
        localStorage.removeItem(versioned_key);
        return true;
    }
    catch (_a) {
        return false;
    }
}
export function writeLocalStorage(key, payload, lifetime = 30, site_id = 'default') {
    const versioned_key = key + '_' + getAppVersion() + '_' + site_id;
    try {
        localStorage.setItem(versioned_key, JSON.stringify({
            data: payload,
            written: Date.now(),
            expires: Date.now() + lifetime * 60 * 1000, // cache lifetime in ms
            expires_human: new Date(Date.now() + lifetime * 60 * 1000),
        }));
        return true;
    }
    catch (_a) {
        return false;
    }
}
