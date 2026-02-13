export type PayloadDataType = {
    [key: string]: string | number | null;
};
export declare function readCSV(file_path: string): PayloadDataType[];
export declare function readJSON(file_path: string): PayloadDataType[];
export declare function normalizeHeaders(data: PayloadDataType[]): PayloadDataType[];
export declare function filterValidEntries(data: PayloadDataType[]): PayloadDataType[];
