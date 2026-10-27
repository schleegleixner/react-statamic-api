import type Sharp from 'sharp';
export default function getProcessedImageData(site_id: string | undefined, sharp: typeof Sharp | null, file_name: string, width: number, height?: number | null, quality?: number): Promise<Buffer | false>;
