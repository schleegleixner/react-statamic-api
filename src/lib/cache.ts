import * as fs from 'fs'
import https from 'https'
import path from 'path'
import { getCachedFilePath } from '../utils/filesystem'
import { getCacheEndpoint } from '../utils/api'
import { getFileContent } from '../response/responseContent'

const insecure_agent = new https.Agent({
  rejectUnauthorized: false,
})

// read the data from the cache
export async function readCache(
  site_id: string = 'default',
  content_type: string,
  folder: string | boolean = false,
  id: string | number | boolean = false,
  ignore_stale: boolean = false,
) {
  const endpoint =
    getCacheEndpoint('cache') +
    `?site_id=${site_id}&content_type=${content_type}&folder=${folder}&id=${id}&ignore_stale=${ignore_stale}`

  try {
    // @ts-expect-error -- agent is not part of the native fetch types but supported in Node.js
    const response = await fetch(endpoint, { next: { tags: ['cached_data'] }, agent: insecure_agent })

    if (response.status !== 200) {
      // eslint-disable-next-line no-console
      console.error(
        `🚫 Cache read error at endpoint: ${endpoint} - Status: ${response.status}`,
      )
    }

    const cache_data = await response.text()
    const json_data = JSON.parse(cache_data)

    return json_data.payload ?? json_data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`🚫 Error reading cache at endpoint: ${endpoint}`, error)
    // write a log entry about the error
    await writeCache(
      // get timestamp (YYYY-MM-DD)
      getCachedFilePath('logs/' + new Date().toISOString().split('T')[0], content_type, folder, 'error.log'),
      {
        message: `Error reading cache at endpoint: ${endpoint}`,
        error: error instanceof Error ? error.message : String(error),
      },
    )
    return null
  }
}

export async function readApiCache(file_name: string) {
  // first try to read from the api cache
  const result = readCache('global', 'api', false, file_name)

  if (result) {
    return result
  }

  // fallback to the alternative location
  return readCache('global', 'data', false, file_name)
}

export interface CachedApiFile {
  data: any
  expired: boolean
}

/**
 * Read an API cache entry straight from disk.
 *
 * Unlike `readApiCache`, this deliberately avoids the self-HTTP roundtrip
 * against `NEXT_PUBLIC_URL/api/cache`. The data route runs inside the same
 * Next.js server that owns the cache files, so reading the filesystem directly
 * removes an entire class of failures (DNS/TLS/hairpin/CDN/timeouts) and works
 * even when the public URL is unreachable from the server itself.
 *
 * Handles both cache shapes transparently:
 *  - wrapped `{ payload, expiry }` files written by this library
 *  - bare JSON files (e.g. arrays written by external scripts) without expiry
 */
export function readApiCacheFile(file_name: string): CachedApiFile | null {
  // mirror readApiCache's lookup order: 'api' folder first, 'data' as fallback
  for (const content_type of ['api', 'data']) {
    const json = getFileContent('global', content_type, false, file_name)

    if (json === false) {
      continue
    }

    const has_wrapper =
      json !== null &&
      typeof json === 'object' &&
      !Array.isArray(json) &&
      'payload' in json

    const expiry = has_wrapper ? json.expiry : false
    const expired = typeof expiry === 'number' && Date.now() > expiry

    return {
      data: has_wrapper ? json.payload : json,
      expired,
    }
  }

  return null
}

// write data to the cache
async function writeCache(
  file_path: string,
  data: any,
  lifetime: number | boolean = false,
) {
  interface CachePayload {
    payload: any
    expiry: number | false
  }

  const payload: CachePayload = {
    payload: data,
    expiry: false,
  }

  if (lifetime && typeof lifetime === 'number') {
    payload.expiry = Date.now() + lifetime * 60 * 1000
  }

  await writeFile(file_path, payload)
}

// write content data to the cache
export async function writeContentCache(
  site_id: string = 'default',
  content_type: string,
  folder_path: string | boolean = false,
  id: string | number | boolean = false,
  data: any,
  lifetime: number | boolean = false,
) {
  await writeCache(
    getCachedFilePath(site_id, content_type, folder_path, id),
    data,
    lifetime,
  ) // write the data to the cache
}

// write API data to the cache
export async function writeApiCache(
  file_name: string,
  data: any,
  lifetime: number = 6 * 60,
  folder: string = 'api',
) {
  writeContentCache('global', folder, false, file_name, data, lifetime)
}

// write data to a file
export async function writeFile(file_path: string, data: any) {
  try {
    // ensure the directory exists, create if it doesn't
    await fs.promises.mkdir(path.dirname(file_path), { recursive: true })

    // convert data to string if it's not already
    const file_data = typeof data === 'string' ? data : JSON.stringify(data)

    // Write to a temp file then rename. rename() is atomic on the same
    // filesystem, so concurrent readers never observe a half-written
    // (truncated) file — the classic cause of JSON.parse failures.
    const tmp_path = `${file_path}.${process.pid}.${Date.now()}.tmp`
    await fs.promises.writeFile(tmp_path, file_data, 'utf8')
    await fs.promises.rename(tmp_path, file_path)

    // eslint-disable-next-line no-console
    console.log('💾 File saved:', file_path.split('/cache/')[1])

    return true
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('🚫 Error saving file:', error)
    return false
  }
}

// write a buffer to a file
export async function writeBuffer(
  file_path: string,
  buffer: Buffer,
): Promise<boolean> {
  try {
    file_path = file_path.replace(/\/\//g, '/') // remove double slashes from the path
    await fs.promises.mkdir(path.dirname(file_path), { recursive: true })
    await fs.promises.writeFile(file_path, buffer as any)
    // eslint-disable-next-line no-console
    console.log('💾 Buffer saved:', file_path.split('/cache/')[1])
    return true
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('🧨 Error writing buffer:', error)
    return false
  }
}