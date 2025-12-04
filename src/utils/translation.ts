type Translations = Record<string, string>

let active_translations: Translations = {}
let active_site_id: string = ''

export const setTranslations = (translations: Translations) => {
  active_translations = translations || {}
}

export const setSiteId = (site_id: string) => {
  active_site_id = site_id || ''
}

export const getGlobalString = (key: string): string => {
  if (
    Object.keys(active_translations).length === 0 ||
    !(key in active_translations)
  ) {
    return `[${key}]`
  }

  return active_translations[key]
}

export const getSiteId = (): string => {
  return active_site_id
}

export const normalizeTranslations = (
  entries: Array<{ key: string; value: string }>,
) => {
  if (!entries || entries.length === 0) {
    return {}
  }
  return entries.reduce(
    (acc, item) => {
      acc[item.key] = item.value
      return acc
    },
    {} as Record<string, string>,
  )
}
