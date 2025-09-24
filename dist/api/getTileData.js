var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getCachedData } from '../lib/content';
export default function getTileData() {
    return __awaiter(this, arguments, void 0, function* (site_id = 'default', id, attribute = false, default_value = []) {
        const data = yield getCachedData(`content?collection=tile&id=${id}&site_id=${site_id}`);
        if (attribute !== false) {
            return data && data[attribute] ? data[attribute] : default_value;
        }
        return data || default_value;
    });
}
