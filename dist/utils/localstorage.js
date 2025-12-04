export function getAppVersion() {
    var _a;
    return ((typeof process !== 'undefined' && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.NEXT_PUBLIC_APP_VERSION)) ||
        '1.0');
}
export function readLocalStorage(key) {
    const versioned_key = key + '_' + getAppVersion();
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
export function writeLocalStorage(key, payload, lifetime = 30) {
    const versioned_key = key + '_' + getAppVersion();
    try {
        localStorage.setItem(versioned_key, JSON.stringify({
            data: payload,
            expires: Date.now() + lifetime * 60 * 1000, // cache lifetime in ms
            expires_human: new Date(Date.now() + lifetime * 60 * 1000),
        }));
        return true;
    }
    catch (_a) {
        return false;
    }
}
