var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
import { getCachePath } from '../utils/filesystem'
import fs from 'fs/promises'
import path from 'path'
export default function processedImageData(sharp_1, file_name_1, width_1) {
  return __awaiter(
    this,
    arguments,
    void 0,
    function* (sharp, file_name, width, height = null, quality = 80) {
      if (typeof window !== 'undefined') {
        throw new Error('processImageData cannot be run in the browser')
      }
      if (!file_name || (Array.isArray(file_name) && file_name.length === 0)) {
        return false
      }
      const src_path = getCachePath(false, 'images', path.basename(file_name))
      const cache_dir = getCachePath(false, 'images')
      const base = path.basename(src_path, path.extname(src_path))
      const deriv_name = `${base}_${width}x${height !== null && height !== void 0 ? height : 'auto'}_q${quality}.jpg`
      const cache_path = path.join(cache_dir, deriv_name)

      try {
        yield fs.mkdir(cache_dir, { recursive: true })
        try {
          const cached_file = yield fs.readFile(cache_path)
          console.log('return cached_file', cached_file)
          return cached_file
        } catch (_a) {
          // no cached file, continue
        }
        const buffer = yield fs.readFile(src_path)
        const data = yield sharp(buffer)
          .resize(width, height)
          .jpeg({ quality })
          .toBuffer()
        fs.writeFile(cache_path, new Uint8Array(data)).catch(() => void 0)
        return data
      } catch (error) {
        console.error('Error processing image data:', error)
        return false
      }
    },
  )
}
