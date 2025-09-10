import * as fs from 'fs'
import path from 'path'
import { getCachedFilePath, getCacheRootPath } from '../utils/filesystem'
import { getCacheEndpoint } from '../utils/api'

// read the data from the cache
export async function readCache(
  content_type: string,
  folder: string | boolean = false,
  id: string | number | boolean = false,
  ignore_stale: boolean = false,
) {
  try {
    const response = await fetch(
      getCacheEndpoint('cache') +
        `?content_type=${content_type}&folder=${folder}&id=${id}&ignore_stale=${ignore_stale}`,
      { next: { tags: ['cached_data'] } },
    )
    const cache_data = await response.text()
    const json_data = JSON.parse(cache_data)

    return json_data.payload ?? json_data
  } catch {
    return null
  }
}

export async function readApiCache(file_name: string) {
  return readCache('api', false, file_name)
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
  content_type: string,
  folder_path: string | boolean = false,
  id: string | number | boolean = false,
  data: any,
  lifetime: number | boolean = false,
) {
  await writeCache(
    getCachedFilePath(content_type, folder_path, id),
    data,
    lifetime,
  ) // write the data to the cache
}

// write API data to the cache
export async function writeApiCache(
  file_name: string,
  data: any,
  lifetime: number = 6 * 60,
) {
  writeContentCache('api', false, file_name, data, lifetime)
}

// write data to a file
export async function writeFile(file_path: string, data: any) {
  try {
    // ensure the directory exists, create if it doesn't
    await fs.promises.mkdir(path.dirname(file_path), { recursive: true })

    // convert data to string if it's not already
    const file_data = typeof data === 'string' ? data : JSON.stringify(data)

    // write data to the file
    await fs.promises.writeFile(file_path, file_data, 'utf8')

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
    console.log('💾 Buffer saved:', file_path.split('/sdd-marburg-app/')[1])
    return true
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('🧨 Error writing buffer:', error)
    return false
  }
}

// clear the content cache
export async function flushCache() {
  const cache_root_path = getCacheRootPath()
  if (!fs.existsSync(cache_root_path)) {
    return true
  }

  for (const lang_dir of fs.readdirSync(cache_root_path)) {
    const lang_path = path.join(cache_root_path, lang_dir)
    if (!fs.statSync(lang_path).isDirectory()) {
      continue
    }

    for (const entry of fs.readdirSync(lang_path)) {
      if (entry === 'data') {
        continue
      }
      const entry_path = path.join(lang_path, entry)
      if (fs.statSync(entry_path).isDirectory()) {
        fs.rmSync(entry_path, { recursive: true })
        fs.mkdirSync(entry_path)
      } else {
        fs.rmSync(entry_path)
      }
    }
  }

  return true
}

type RevalidateResult = {
  success: boolean
  error?: string
}

export async function revalidateContent(): Promise<RevalidateResult> {
  try {
    const response = await fetch(getCacheEndpoint('revalidate'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to revalidate. Status: ${response.status}`,
      }
    }

    return { success: true }
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
