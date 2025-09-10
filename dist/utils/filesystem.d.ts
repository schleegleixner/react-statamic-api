export declare function getCacheRootPath(): string;
export declare function getCachePath(language?: string | boolean | null, content_type?: string, folder?: string | boolean, filename?: string | boolean): string;
export declare function getCachedFilePath(content_type: string | undefined, folder: string | boolean | undefined, id: string | number | boolean): string;
export declare function findDataFile(filename?: string | boolean): string | false;
