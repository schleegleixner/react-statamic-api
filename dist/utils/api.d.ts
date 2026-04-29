export declare function checkSecret(secret: string): boolean;
export declare function getCMSEndpoint(url?: string): string;
export declare function getCacheEndpoint(url?: string): string;
export declare function fetchJSON(endpoint: string, options?: {
    silentNotFound?: boolean;
}): Promise<any>;
export declare function fetchFile(endpoint: string): Promise<Buffer | null>;
