var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
import https from 'https';
// checkSecret with req parameter
export function checkSecret(req) {
    const { secret } = req.query;
    const api_secret = process.env.API_SECRET;
    if (!api_secret) {
        return false;
    }
    return typeof secret === 'string' && secret === api_secret;
}
export function getCMSEndpoint(url = '') {
    const endpoint = process.env.SSD_API + url;
    return endpoint.replace(/([^:]\/)\/+/g, '$1'); // remove double slashes
}
export function getCacheEndpoint(url = '') {
    const endpoint = process.env.NEXT_PUBLIC_URL + '/api/' + url;
    return endpoint.replace(/([^:]\/)\/+/g, '$1'); // remove double slashes
}
export function fetchJSON(endpoint) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const timeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 5000;
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        try {
            const response = yield axios.get(endpoint.replace(/([^:]\/)\/+/g, '$1'), {
                timeout,
                httpsAgent: agent,
            });
            if (((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.result) === 'success' || (response === null || response === void 0 ? void 0 : response.status) === 200) {
                return (_c = (_b = response === null || response === void 0 ? void 0 : response.data) === null || _b === void 0 ? void 0 : _b.payload) !== null && _c !== void 0 ? _c : response === null || response === void 0 ? void 0 : response.data;
            }
            return null;
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('fetchJSON error:', error);
            return null;
        }
    });
}
export function fetchFile(endpoint) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(endpoint, {
                next: { tags: ['cached_files'] },
            });
            if (response.status !== 200) {
                return null;
            }
            const array_buffer = yield response.arrayBuffer();
            return Buffer.from(array_buffer);
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('fetchFile error:', error);
            return null;
        }
    });
}
