export type PayloadDataType = {
  [key: string]: string
}

export function filterValidEntries(
  data: PayloadDataType[],
  needs_valid_data: boolean = false,
): PayloadDataType[] {
  if (!data.length) {
    return []
  }

  const firstColumnKey: string | undefined = Object.keys(data[0])[0]
  const firstKeyIsNumeric: boolean = !isNaN(Number(firstColumnKey)) // check if first key is numeric, should be year then

  if (!firstColumnKey) {
    throw new Error('Data does not contain any keys.')
  }

  return data
    .map(entry => {
      // create a new object with filtered keys
      const filtered_entry: PayloadDataType = {} as PayloadDataType
      for (const [key, value] of Object.entries(entry)) {
        if (key && !key.startsWith('_')) {
          filtered_entry[key] = value
        }
      }
      return filtered_entry
    })
    .filter(entry => {
      const isFirstColumnValid: boolean =
        (typeof entry[firstColumnKey] === 'string' &&
          entry[firstColumnKey].trim() !== '') ||
        (typeof entry[firstColumnKey] === 'number' &&
          !isNaN(Number(entry[firstColumnKey]))) ||
        firstKeyIsNumeric

      const hasValidData: boolean = Object.entries(entry).some(
        ([key, value]) => {
          return (
            key !== firstColumnKey &&
            typeof value === 'string' &&
            value.trim() !== ''
          )
        },
      )

      return isFirstColumnValid && (hasValidData || needs_valid_data)
    })
}

export function normalizeHeaders(data: PayloadDataType[]): PayloadDataType[] {
  return data.map(entry => {
    const normalizedEntry: PayloadDataType = {}

    Object.keys(entry).forEach(key => {
      // normalize timescale keys
      const normalizedKey =
        key.toUpperCase() === 'ZEIT' || key.toUpperCase() === 'JAHR'
          ? 'INDEX'
          : key
      normalizedEntry[normalizedKey] = entry[key]

      // remove leading and trailing whitespace from keys
      const trimmedKey = normalizedKey.trim()
      normalizedEntry[trimmedKey] = entry[key]
    })

    return normalizedEntry
  })
}
