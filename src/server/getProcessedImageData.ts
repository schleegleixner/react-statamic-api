import { getCachePath } from '../utils/filesystem'
import fs from 'fs'
import path from 'path'

export default async function getProcessedImageData(
  sharp: typeof import('sharp') | null,
  file_name: string,
  width: number,
  height: number | null = null,
  quality: number = 80,
): Promise<Buffer | false> {
  if (typeof window !== 'undefined') {
    throw new Error('processImageData cannot be run in the browser')
  }

  if (!file_name || (Array.isArray(file_name) && file_name.length === 0)) {
    return false
  }

  const src_path = getCachePath(false, 'images', path.basename(file_name))
  const cache_dir = getCachePath(false, 'images')
  const base = path.basename(src_path, path.extname(src_path))
  const deriv_name = `${base}_${width}x${height ?? 'auto'}_q${quality}.jpg`
  const cache_path = path.join(cache_dir, deriv_name)

  try {
    await fs.promises.mkdir(cache_dir, { recursive: true })

    try {
      const cached_file = await fs.promises.readFile(cache_path)
      return cached_file
    } catch {
      // no cached file, continue
    }

    const buffer = await fs.promises.readFile(src_path)

    if (!sharp) {
      return buffer
    }

    const data = await sharp(buffer)
      .resize(width, height)
      .jpeg({ quality })
      .toBuffer()

    fs.writeFile(cache_path, new Uint8Array(data), () => void 0)

    return data
  } catch {
    return false
  }
}
