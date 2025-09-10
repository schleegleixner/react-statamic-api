import { NextApiRequest } from 'next';
export declare function checkSecret(req: NextApiRequest): boolean;
export declare function getCMSEndpoint(url?: string): string;
export declare function getCacheEndpoint(url?: string): string;
export declare function fetchJSON(endpoint: string): Promise<any>;
export declare function fetchFile(endpoint: string): Promise<Buffer | null>;
