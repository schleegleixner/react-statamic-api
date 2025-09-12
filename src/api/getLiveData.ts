import { getCachedData } from '../lib/content'
import { readLocalStorage, writeLocalStorage } from '../utils/localstorage'

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
