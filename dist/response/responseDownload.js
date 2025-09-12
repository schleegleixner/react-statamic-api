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
import { getCachePath } from '../utils/filesystem';
export default function responseDownload(file_name) {
    return __awaiter(this, void 0, void 0, function* () {
        const file_path = getCachePath(false, 'source', file_name);
        try {
            yield fs.promises.stat(file_path);
        }
        catch (_a) {
            return new Response(`Die Datei ${file_name} ist nicht verfügbar.`, {
                status: 404,
            });
        }
        const file_buffer = yield fs.promises.readFile(file_path);
        const response = new Response(new Uint8Array(file_buffer));
        response.headers.set('Content-Type', 'application/octet-stream');
        response.headers.set('Content-Disposition', `attachment; filename="${file_name}"`);
        return response;
    });
}
