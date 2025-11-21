import fs from 'fs'

const cache_folder = 'cache'
const default_site_id = 'default'

export function getCacheRootPath(site_id?: string | boolean | undefined) {
  return [process.cwd(), cache_folder, site_id].filter(Boolean).join('/')
}

export function ensureCacheFolder(site_id: string = 'default') {
  const cache_path = getCacheRootPath(site_id)

  if (!fs.existsSync(cache_path)) {
    fs.mkdirSync(cache_path, { recursive: true })
  }

  return cache_path
}

export async function moveTemporaryFolder(
  temporary_folder: string,
  site_id: string,
): Promise<boolean> {
  const temp_path = getCacheRootPath(temporary_folder)
  const site_path = getCacheRootPath(site_id)

  try {
    // remove existing site folder
    if (fs.existsSync(site_path)) {
      fs.rmSync(site_path, { recursive: true, force: true })
    }

    // create new destination folder
    fs.mkdirSync(site_path, { recursive: true })

    // copy everything from temp → site
    fs.cpSync(temp_path, site_path, { recursive: true, force: true })

    // nuke the temporary folder
    fs.rmSync(temp_path, { recursive: true, force: true })

    console.log(`💀 Moved and overwrote cache folder for site '${site_id}'`)

    return true
  } catch (error) {
    console.error(
      `☠️  Failed to move folder '${temporary_folder}' → '${site_id}':`,
      error,
    )
    return false
  }
}

export function getCachePath(
  site_id: string | boolean | null = null,
  content_type: string = 'content',
  folder: string | boolean = false,
  filename: string | boolean = false,
) {
  if (site_id === false) {
    site_id = null
  }

  const path = [
    getCacheRootPath(site_id ?? default_site_id),
    content_type,
    folder,
    filename,
  ]
    .filter(Boolean)
    .join('/')

  return path
}

export function getCachedFilePath(
  site_id: string = 'default',
  content_type: string = 'content',
  folder: string | boolean = false,
  id: string | number | boolean,
) {
  return getCachePath(
    site_id,
    content_type,
    id ? folder : false,
    `${id || folder || 'default'}.json`,
  )
}

export function findDataFile(
  filename: string | boolean = false,
  site_id: string | null = null,
): string | false {
  const folders = ['data', 'source']

  // check if file exists in any of the paths
  for (const folder of folders) {
    const full_path = getCachePath(site_id, folder, filename)

    if (fs.existsSync(full_path)) {
      return full_path
    }
  }

  return false
}
