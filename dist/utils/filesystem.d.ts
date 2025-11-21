export declare function getCacheRootPath(site_id?: string | boolean | undefined): string;
export declare function ensureCacheFolder(site_id?: string): string;
export declare function moveTemporaryFolder(temporary_folder: string, site_id: string): Promise<boolean>;
export declare function getCachePath(site_id?: string | boolean | null, content_type?: string, folder?: string | boolean, filename?: string | boolean): string;
export declare function getCachedFilePath(site_id: string | undefined, content_type: string | undefined, folder: string | boolean | undefined, id: string | number | boolean): string;
export declare function findDataFile(filename?: string | boolean, site_id?: string | null): string | false;
