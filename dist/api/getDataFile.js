var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import path from 'path';
import { findDataFile } from '../utils/filesystem';
import { readCSV, readExcel, readJSON } from '../utils/import';
export default function getDataFile(file_name) {
    return __awaiter(this, void 0, void 0, function* () {
        const sanitized_file_name = path.basename(file_name);
        const file_path = findDataFile(sanitized_file_name);
        if (!file_path) {
            return [];
        }
        const ext = path.extname(sanitized_file_name).toLowerCase();
        if (ext === '.csv') {
            return readCSV(file_path);
        }
        else if (ext === '.json') {
            return readJSON(file_path);
        }
        else if (ext === '.xlsx' || ext === '.xls') {
            return yield readExcel(file_path);
        }
        // wrong file extension
        return [];
    });
}
