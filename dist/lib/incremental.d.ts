import { FlushChanges, FlushRelease, RebuildMode } from '../types/cms';
export declare function parseRelease(body: any): FlushRelease;
export declare function readRelease(site_id: string): string | null;
export declare function writeRelease(folder: string, release?: string): void;
export declare function prepareTemporaryFolder(temporary_folder: string, site_id: string, release: FlushRelease): RebuildMode;
export declare function fileNameFromPath(file_path: string): string;
export declare function needsTransfer(changes: FlushChanges | undefined, key: keyof FlushChanges, id: string, cached_path: string): boolean;
export declare function pruneOrphans(temporary_folder: string, data: any): void;
