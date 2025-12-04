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
        expires: Date.now() + lifetime * 60 * 1000, // cache lifetime in ms
        expires_human: new Date(Date.now() + lifetime * 60 * 1000),
      }),
    )
    return true
  } catch {
    return false
  }
}
