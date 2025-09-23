var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getAPI } from '../lib';
export default function responseLiveData(req) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { searchParams } = new URL(req.url);
        const route = searchParams.get('route');
        const lifetime = parseInt(searchParams.get('lifetime'), 10);
        if (!route) {
            return new Response(null, {
                status: 404,
            });
        }
        try {
            const data = yield getAPI(route, true, lifetime);
            if (data === null || data === '') {
                return new Response(null, {
                    status: 404,
                });
            }
            return new Response(JSON.stringify((_a = data.payload) !== null && _a !== void 0 ? _a : data), {
                status: 200,
            });
        }
        catch (_b) {
            return new Response(null, {
                status: 404,
            });
        }
    });
}
