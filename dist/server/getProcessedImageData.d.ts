export default function getProcessedImageData(sharp: typeof import('sharp') | null, file_name: string, width: number, height?: number | null, quality?: number): Promise<Buffer | false>;
