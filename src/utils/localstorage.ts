export function getAppVersion() {
  return (
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_VERSION) ||
    '1.0'
  )
}

export function readLocalStorage(key: string, site_id: string = 'default') {
  if (site_id === 'preview') {
    return null // preview mode does not use localStorage
  }

  const versioned_key = key + '_' + getAppVersion() + '_' + site_id
  try {
    const raw = localStorage.getItem(versioned_key)
    if (!raw) {
      return null
    }
    const { expires, data } = JSON.parse(raw)
    if (Date.now() > expires) {
      localStorage.removeItem(versioned_key)
      return null
    }
    return data
  } catch {
    return null
  }
}

export interface LocalStorageMeta<T = unknown> {
  data: T
  /** Absolute expiry timestamp in ms. */
  expires: number
  /** When the entry was written, in ms. `null` for legacy entries. */
  written: number | null
  /** True once `expires` has passed (entry is kept, not removed). */
  is_expired: boolean
}

/**
 * Like `readLocalStorage` but returns cache metadata and, crucially, does NOT
 * delete expired entries. This lets callers (e.g. `useLiveData`) keep showing
 * the last known value offline while flagging it as stale.
 */
export function readLocalStorageWithMeta<T = unknown>(
  key: string,
  site_id: string = 'default',
): LocalStorageMeta<T> | null {
  if (site_id === 'preview') {
    return null
  }

  const versioned_key = key + '_' + getAppVersion() + '_' + site_id
  try {
    const raw = localStorage.getItem(versioned_key)
    if (!raw) {
      return null
    }
    const { expires, data, written } = JSON.parse(raw)
    return {
      data,
      expires,
      written: typeof written === 'number' ? written : null,
      is_expired: Date.now() > expires,
    }
  } catch {
    return null
  }
}

export function removeLocalStorage(key: string, site_id: string = 'default') {
  if (site_id === 'preview') {
    return false
  }

  const versioned_key = key + '_' + getAppVersion() + '_' + site_id
  try {
    localStorage.removeItem(versioned_key)
    return true
  } catch {
    return false
  }
}

export function writeLocalStorage(
  key: string,
  payload: unknown,
  lifetime: number = 30,
  site_id: string = 'default',
) {
  const versioned_key = key + '_' + getAppVersion() + '_' + site_id

  try {
    localStorage.setItem(
      versioned_key,
      JSON.stringify({
        data: payload,
        written: Date.now(),
        expires: Date.now() + lifetime * 60 * 1000, // cache lifetime in ms
        expires_human: new Date(Date.now() + lifetime * 60 * 1000),
      }),
    )
    return true
  } catch {
    return false
  }
}
