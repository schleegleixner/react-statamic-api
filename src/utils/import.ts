import Papa from 'papaparse'
import ExcelJS from 'exceljs'
import fs from 'fs'

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

export async function readExcel(file_path: string): Promise<PayloadDataType[]> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(file_path)

  const sheet = workbook.worksheets[0]
  const rows: PayloadDataType[] = []
  let headers: string[] = []

  sheet.eachRow((row, row_number) => {
    const values = Array.isArray(row.values) ? row.values.slice(1) : []
    if (row_number === 1) {
      headers = values.map(v => String(v ?? ''))
    } else {
      const obj: PayloadDataType = { INDEX: row_number }
      headers.forEach((key, i) => {
        const val = values[i]
        obj[key] = typeof val === 'number' ? val : null
      })
      rows.push(obj)
    }
  })

  return rows
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
        // skip keys that start with _
        if (key === '' || key.startsWith('_')) {
          continue
        }

        // remove \r and \n from strings
        let cleaned_value = value
        if (typeof value === 'string') {
          cleaned_value = value.replace(/[\r\n]+/g, ' ').trim()
        }

        const numeric_value =
          typeof cleaned_value === 'number'
            ? cleaned_value
            : parseFloat(String(cleaned_value).replace(',', '.'))

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
