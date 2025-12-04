export function getAppVersion() {
  return (
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_VERSION) ||
    '1.0'
  )
}

export function readLocalStorage(key: string) {
  const versioned_key = key + '_' + getAppVersion()
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
) {
  const versioned_key = key + '_' + getAppVersion()

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
