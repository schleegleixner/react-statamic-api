export declare function readCache(content_type: string, folder?: string | boolean, id?: string | number | boolean, ignore_stale?: boolean): Promise<any>;
export declare function readApiCache(file_name: string): Promise<any>;
export declare function writeContentCache(content_type: string, folder_path: string | boolean | undefined, id: string | number | boolean | undefined, data: any, lifetime?: number | boolean): Promise<void>;
export declare function writeApiCache(file_name: string, data: any, lifetime?: number): Promise<void>;
export declare function writeFile(file_path: string, data: any): Promise<boolean>;
export declare function writeBuffer(file_path: string, buffer: Buffer): Promise<boolean>;
export declare function flushCache(): Promise<boolean>;
export declare function revalidateContent(): Promise<{
    success: boolean;
    error?: string;
}>;
