import { getCachedData } from '../lib/content'
import {
  readLocalStorage,
  readLocalStorageWithMeta,
  writeLocalStorage,
} from '../utils/localstorage'

export interface LiveDataResult<T = unknown> {
  data: T | null
  /** When the returned data was fetched, in ms. `null` if unknown. */
  cached_at: number | null
  /** Absolute expiry timestamp in ms. `null` if unknown. */
  expires: number | null
  /** True when the data was served from (a possibly expired) local cache. */
  from_cache: boolean
}

/**
 * Like `getLiveData`, but returns cache metadata and, when the network fails,
 * falls back to expired local cache instead of returning nothing. Powers the
 * "stale" detection in `useLiveData`.
 */
export async function getLiveDataWithMeta<T = unknown>(
  route: string,
  lifetime: number = 30,
): Promise<LiveDataResult<T>> {
  const cache_key = `sdd_api_cache_${route}`
  const cached = readLocalStorageWithMeta<T>(cache_key)

  if (cached && !cached.is_expired) {
    return {
      data: cached.data,
      cached_at: cached.written,
      expires: cached.expires,
      from_cache: true,
    }
  }

  try {
    const data = await getCachedData(`data?route=${route}&lifetime=${lifetime}`)
    if (data !== null && data !== '') {
      writeLocalStorage(cache_key, data, lifetime)
      const now = Date.now()
      return {
        data: data as T,
        cached_at: now,
        expires: now + lifetime * 60 * 1000,
        from_cache: false,
      }
    }
  } catch {
    // fall through to stale cache below
  }

  // Offline or empty response: serve stale cache if we have any.
  if (cached) {
    return {
      data: cached.data,
      cached_at: cached.written,
      expires: cached.expires,
      from_cache: true,
    }
  }

  return { data: null, cached_at: null, expires: null, from_cache: false }
}

export default async function getLiveData(
  route: string,
  lifetime: number = 30,
  default_value: any = '',
  use_local_storage: boolean = true,
) {
  const cache_key: string = `sdd_api_cache_${route}`

  // check for cached data in localStorage
  if (use_local_storage) {
    const data = readLocalStorage(cache_key)

    if (data) {
      return data
    }
  }

  try {
    const data = await getCachedData(`data?route=${route}&lifetime=${lifetime}`)
    if (data !== null && data !== '') {
      if (use_local_storage) {
        writeLocalStorage(cache_key, data, lifetime)
      }

      return data
    }
  } catch (error) {
    throw new Error(
      `Failed to fetch data: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return default_value
}
