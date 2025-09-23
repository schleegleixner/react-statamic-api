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
import { getCachedFilePath } from '../utils/filesystem';
const parseBooleanOrString = (value) => {
    if (value === null) {
        return '';
    }
    return value === 'true' ? true : value === 'false' ? false : value;
};
export default function responseContent(req) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const { searchParams } = new URL(req.url);
        const locale = searchParams.get('locale') || 'default';
        const content_type = (_a = searchParams.get('content_type')) !== null && _a !== void 0 ? _a : 'content';
        const folder = parseBooleanOrString(searchParams.get('folder'));
        const id = parseBooleanOrString(searchParams.get('id'));
        const ignore_stale = searchParams.get('ignore_stale') === 'true';
        try {
            const cache_path = getCachedFilePath(locale, content_type, folder, id);
            if (!fs.existsSync(cache_path)) {
                return new Response(null, {
                    status: 404,
                });
            }
            const cache_data = fs.readFileSync(cache_path, 'utf8');
            const json_data = JSON.parse(cache_data);
            if (!ignore_stale && json_data.expiry && Date.now() > (json_data === null || json_data === void 0 ? void 0 : json_data.expiry)) {
                return new Response(null, { status: 410 });
            }
            return new Response(JSON.stringify((_b = json_data.payload) !== null && _b !== void 0 ? _b : json_data), {
                status: 200,
            });
        }
        catch (_c) {
            return new Response(null, {
                status: 404,
            });
        }
    });
}
