var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { checkSecret } from '../utils/api';
import { fetchFromStatamic } from '../lib/cms';
function withCors(body, status, extra_headers = {}) {
    return new Response(body, {
        status,
        headers: Object.assign({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }, extra_headers),
    });
}
export default function responseFlush(req) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const { searchParams } = new URL(req.url);
        const secret = (_a = searchParams.get('secret')) !== null && _a !== void 0 ? _a : '';
        let sites = [];
        // try to get sites from query params
        try {
            const body = yield req.json();
            sites = (_b = body.sites) !== null && _b !== void 0 ? _b : [];
        }
        catch (_e) {
            sites = (_d = (_c = process.env.SITE_IDS) === null || _c === void 0 ? void 0 : _c.split(',')) !== null && _d !== void 0 ? _d : ['default'];
        }
        if (!checkSecret(secret)) {
            return withCors(JSON.stringify({ message: 'Unauthorized' }), 401);
        }
        const result = yield fetchFromStatamic(sites);
        return withCors(JSON.stringify(result), 200);
    });
}
export function OPTIONS() {
    return __awaiter(this, void 0, void 0, function* () {
        return withCors(null, 204);
    });
}
