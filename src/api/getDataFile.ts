import path from 'path'
import { findDataFile } from '../utils/filesystem'
import { PayloadDataType, readCSV, readExcel, readJSON } from '../utils/import'

export default async function getDataFile(
  file_name: string,
): Promise<PayloadDataType[]> {
  const sanitized_file_name = path.basename(file_name)
  const file_path = findDataFile(sanitized_file_name)

  if (!file_path) {
    return []
  }

  const ext = path.extname(sanitized_file_name).toLowerCase()

  if (ext === '.csv') {
    return readCSV(file_path)
  } else if (ext === '.json') {
    return readJSON(file_path)
  } else if (ext === '.xlsx' || ext === '.xls') {
    return await readExcel(file_path)
  }

  // wrong file extension
  return []
}
