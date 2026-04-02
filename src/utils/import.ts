import Papa from 'papaparse'
import fs from 'fs'
import { sanitizeNumber, sanitizeString } from './sanitize'

export type PayloadDataType = {
  [key: string]: string | number | null
}

export function readCSV(file_path: string): PayloadDataType[] {
  const file_data = fs.readFileSync(file_path, 'utf8')
  const delimiter = ';'

  if (!file_data) {
    return []
  }

  // remove comments and empty lines from CSV data
  // comments start with # and are at the beginning of the line
  const cleaned_data = file_data
    .split('\n')
    .filter(line => !line.trim().startsWith('#'))
    .filter(line => !line.trim().startsWith('"'))
    .filter(
      line =>
        line.trim() !== '' &&
        line.replace(new RegExp(delimiter, 'g'), '').trim() !== '',
    )
    .join('\n')

  const result = Papa.parse(cleaned_data, { header: true, delimiter })
    .data as PayloadDataType[]
  const normalizedResult = normalizeHeaders(result)
  return filterValidEntries(normalizedResult)
}

export function readJSON(file_path: string): PayloadDataType[] {
  const file_data = fs.readFileSync(file_path, 'utf8')

  if (!file_data) {
    return []
  }

  return JSON.parse(file_data)
}

export function normalizeHeaders(data: PayloadDataType[]): PayloadDataType[] {
  if (!data.length) {
    return data
  }

  const indexCandidates = ['ZEIT', 'JAHR', 'INDEX']

  // Prüfen ob irgendeine Spalte einem Index-Kandidaten entspricht
  const hasIndexColumn = Object.keys(data[0]).some(key =>
    indexCandidates.includes(sanitizeString(key).toUpperCase()),
  )

  return data.map(entry => {
    const normalizedEntry: PayloadDataType = {}

    Object.keys(entry).forEach((key, i) => {
      const raw_key = sanitizeString(key)
      const upperKey = raw_key.toUpperCase()

      let normalizedKey: string
      if (indexCandidates.includes(upperKey)) {
        // Bekannter Index-Kandidat → immer umbenennen
        normalizedKey = 'INDEX'
      } else if (!hasIndexColumn && i === 0) {
        // Kein Index-Kandidat gefunden → erste Spalte als Fallback
        normalizedKey = 'INDEX'
      } else {
        normalizedKey = raw_key
      }

      normalizedEntry[normalizedKey.trim()] = entry[key]
    })

    return normalizedEntry
  })
}


export function filterValidEntries(data: PayloadDataType[]): PayloadDataType[] {
  if (!data.length) {
    return []
  }

  const first_column_key: string | undefined = Object.keys(data[0])[0]

  if (!first_column_key) {
    return []
  }

  return data
    .map(entry => {
      // create a new object with filtered keys
      const filtered_entry: PayloadDataType = {} as PayloadDataType
      for (const [key, value] of Object.entries(entry)) {
        // skip empty keys and keys that start with _ entirely
        if (key === null || key === '' || key.startsWith('_')) {
          continue
        }

        // convert index key to number (if applicable)
        if (key === 'INDEX') {
          filtered_entry[key] = sanitizeNumber(value, value)
          continue
        }

        // remove \r and \n from strings
        let cleaned_value = value
        if (typeof value === 'string') {
          cleaned_value = value.replace(/[\r\n]+/g, ' ').trim()
        }

        const numeric_value = sanitizeNumber(cleaned_value)

        if (!isNaN(numeric_value)) {
          filtered_entry[key] = numeric_value
        } else if (typeof cleaned_value === 'string') {
          filtered_entry[key] =
            cleaned_value.trim() === '' ? null : String(cleaned_value)
        }
      }
      return filtered_entry
    })
    .filter(entry => {
      const valid_first_key: boolean =
        entry[first_column_key] !== null && entry[first_column_key] !== ''

      const has_valid_data: boolean = Object.entries(entry).some(
        ([key, value]) => {
          return key !== first_column_key && value !== null
        },
      )

      return first_column_key !== 'INDEX' || (valid_first_key && has_valid_data)
    })
}
