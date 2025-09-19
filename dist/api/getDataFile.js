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
import fs from 'fs';
import Papa from 'papaparse';
import { filterValidEntries, normalizeHeaders, } from '../utils/payload';
import { findDataFile } from '../utils/filesystem';
export default function getDataFile(file_name) {
    return __awaiter(this, void 0, void 0, function* () {
        const sanitized_file_name = path.basename(file_name);
        const file_path = findDataFile(sanitized_file_name);
        if (!file_path) {
            return false;
        }
        const file_data = fs.readFileSync(file_path, 'utf8');
        if (!file_data) {
            return false;
        }
        const ext = path.extname(sanitized_file_name).toLowerCase();
        if (ext === '.csv') {
            // remove comments from CSV data
            // comments start with # and are at the beginning of the line
            const cleaned_data = file_data
                .split('\n')
                .filter(line => !line.trim().startsWith('#'))
                .join('\n');
            const result = Papa.parse(cleaned_data, { header: true, delimiter: ';' })
                .data;
            const normalizedResult = normalizeHeaders(result);
            return filterValidEntries(normalizedResult);
        }
        else if (ext === '.json') {
            return JSON.parse(file_data);
        }
    });
}
