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
export default function responseFlush(req) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { searchParams } = new URL(req.url);
        const secret = (_a = searchParams.get('secret')) !== null && _a !== void 0 ? _a : '';
        if (!checkSecret(secret)) {
            return new Response(JSON.stringify({ message: 'Unauthorized' }), {
                status: 401,
            });
        }
        const result = yield fetchFromStatamic();
        return new Response(JSON.stringify(result), {
            status: 200,
        });
    });
}
