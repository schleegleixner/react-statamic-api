import { PayloadDataType } from '../utils/import'

export function getTimeline(
  data: PayloadDataType[],
  key: string = 'INDEX',
): number[] {
  if (!data || data.length === 0) {
    return []
  }

  // normalize the key to be case-insensitive
  const normalizedKey = key.toLowerCase()

  return (
    data
      .map(e => {
        const matchedKey = Object.keys(e).find(
          k => k.toLowerCase() === normalizedKey,
        )
        return matchedKey ? e[matchedKey] : undefined
      })
      .filter((year): year is number => year !== undefined) ?? []
  )
}
