export type PayloadDataType = {
    [key: string]: string;
};
export declare function filterValidEntries(data: PayloadDataType[], needs_valid_data?: boolean): PayloadDataType[];
export declare function normalizeHeaders(data: PayloadDataType[]): PayloadDataType[];
