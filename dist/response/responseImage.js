var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import getProcessedImageData from '../server/getProcessedImageData';
export default function responseImage(name, req, sharp) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const { searchParams } = new URL(req.url);
        const w = (_a = searchParams.get('w')) !== null && _a !== void 0 ? _a : '1200';
        const h = (_b = searchParams.get('h')) !== null && _b !== void 0 ? _b : undefined;
        const q = (_c = searchParams.get('q')) !== null && _c !== void 0 ? _c : '75';
        const width = +w; // ensure width is a number
        const height = h !== undefined ? +h : undefined; // ensure height is a number or undefined
        const quality = +q; // ensure quality is a number
        const file_name = Array.isArray(name)
            ? ((_d = name[0]) !== null && _d !== void 0 ? _d : null)
            : name; // ensure name is string
        if (!file_name) {
            return new Response(null, {
                status: 404,
            });
        }
        const result = yield getProcessedImageData(sharp, file_name, width, height, quality);
        if (!result) {
            return new Response(null, {
                status: 404,
            });
        }
        const mime_type = yield sharp(result)
            .metadata()
            .then((m) => { var _a; return (_a = m.format) !== null && _a !== void 0 ? _a : 'jpeg'; });
        return new Response(new Uint8Array(result), {
            status: 200,
            headers: {
                'X-Cache': 'MISS',
                'Content-Type': 'image/' + mime_type,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    });
}
