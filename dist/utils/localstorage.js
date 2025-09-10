export function readLocalStorage(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) {
            return null;
        }
        const { expires, data } = JSON.parse(raw);
        if (Date.now() > expires) {
            localStorage.removeItem(key);
            return null;
        }
        return data;
    }
    catch (_a) {
        return null;
    }
}
export function writeLocalStorage(key, payload, lifetime = 30) {
    try {
        localStorage.setItem(key, JSON.stringify({
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
