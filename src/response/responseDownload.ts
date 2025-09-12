import fs from 'fs'
import { getCachePath } from '../utils/filesystem'

export default async function responseDownload(
  file_name: string,
): Promise<Response> {
  const file_path = getCachePath(false, 'source', file_name)

  try {
    await fs.promises.stat(file_path)
  } catch {
    return new Response(`Die Datei ${file_name} ist nicht verfügbar.`, {
      status: 404,
    })
  }

  const file_buffer = await fs.promises.readFile(file_path)
  const response = new Response(new Uint8Array(file_buffer))

  response.headers.set('Content-Type', 'application/octet-stream')
  response.headers.set(
    'Content-Disposition',
    `attachment; filename="${file_name}"`,
  )

  return response
}
