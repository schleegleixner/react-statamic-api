export function readLocalStorage(key: string) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      return null
    }
    const { expires, data } = JSON.parse(raw)
    if (Date.now() > expires) {
      localStorage.removeItem(key)
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
  try {
    localStorage.setItem(
      key,
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
