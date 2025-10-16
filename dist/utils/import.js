var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import fs from 'fs';
export function readCSV(file_path) {
    const file_data = fs.readFileSync(file_path, 'utf8');
    const delimiter = ';';
    if (!file_data) {
        return [];
    }
    // remove comments and empty lines from CSV data
    // comments start with # and are at the beginning of the line
    const cleaned_data = file_data
        .split('\n')
        .filter(line => !line.trim().startsWith('#'))
        .filter(line => !line.trim().startsWith('"'))
        .filter(line => line.trim() !== '' &&
        line.replace(new RegExp(delimiter, 'g'), '').trim() !== '')
        .join('\n');
    const result = Papa.parse(cleaned_data, { header: true, delimiter })
        .data;
    const normalizedResult = normalizeHeaders(result);
    return filterValidEntries(normalizedResult);
}
export function readJSON(file_path) {
    const file_data = fs.readFileSync(file_path, 'utf8');
    if (!file_data) {
        return [];
    }
    return JSON.parse(file_data);
}
export function readExcel(file_path) {
    return __awaiter(this, void 0, void 0, function* () {
        const workbook = new ExcelJS.Workbook();
        yield workbook.xlsx.readFile(file_path);
        const sheet = workbook.worksheets[0];
        const rows = [];
        let headers = [];
        sheet.eachRow((row, row_number) => {
            const values = Array.isArray(row.values) ? row.values.slice(1) : [];
            if (row_number === 1) {
                headers = values.map(v => String(v !== null && v !== void 0 ? v : ''));
            }
            else {
                const obj = { INDEX: row_number };
                headers.forEach((key, i) => {
                    const val = values[i];
                    obj[key] = typeof val === 'number' ? val : null;
                });
                rows.push(obj);
            }
        });
        return rows;
    });
}
export function normalizeHeaders(data) {
    return data.map(entry => {
        const normalizedEntry = {};
        Object.keys(entry).forEach(key => {
            // normalize timescale keys
            const normalizedKey = key.toUpperCase() === 'ZEIT' || key.toUpperCase() === 'JAHR'
                ? 'INDEX'
                : key;
            normalizedEntry[normalizedKey] = entry[key];
            // remove leading and trailing whitespace from keys
            const trimmedKey = normalizedKey.trim();
            normalizedEntry[trimmedKey] = entry[key];
        });
        return normalizedEntry;
    });
}
export function filterValidEntries(data) {
    if (!data.length) {
        return [];
    }
    const first_column_key = Object.keys(data[0])[0];
    if (!first_column_key) {
        return [];
    }
    return data
        .map(entry => {
        // create a new object with filtered keys
        const filtered_entry = {};
        for (const [key, value] of Object.entries(entry)) {
            // skip keys that start with _
            if (key === '' || key.startsWith('_')) {
                continue;
            }
            // remove \r and \n from strings
            let cleaned_value = value;
            if (typeof value === 'string') {
                cleaned_value = value.replace(/[\r\n]+/g, ' ').trim();
            }
            const numeric_value = typeof cleaned_value === 'number'
                ? cleaned_value
                : parseFloat(String(cleaned_value).replace(',', '.'));
            if (!isNaN(numeric_value)) {
                filtered_entry[key] = numeric_value;
            }
            else if (typeof cleaned_value === 'string') {
                filtered_entry[key] =
                    cleaned_value.trim() === '' ? null : String(cleaned_value);
            }
        }
        return filtered_entry;
    })
        .filter(entry => {
        const valid_first_key = entry[first_column_key] !== null && entry[first_column_key] !== '';
        const has_valid_data = Object.entries(entry).some(([key, value]) => {
            return key !== first_column_key && value !== null;
        });
        return first_column_key !== 'INDEX' || (valid_first_key && has_valid_data);
    });
}
