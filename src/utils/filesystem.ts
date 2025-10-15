import fs from 'fs'

const cache_folder = 'cache'
const default_site_id = 'default'
// const translated_content_types = ['collection', 'content', 'global', 'taxonomy']

export function getCacheRootPath() {
  return [process.cwd(), cache_folder].filter(Boolean).join('/')
}

export function getCachePath(
  site_id: string | boolean | null = null,
  content_type: string = 'content',
  folder: string | boolean = false,
  filename: string | boolean = false,
) {
  // if the content type is not translated, use the default site_id
  /*if (content_type && !translated_content_types.includes(content_type)) {
    site_id = null
  }*/

  const path = [
    getCacheRootPath(),
    site_id ?? default_site_id,
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

export function findDataFile(filename: string | boolean = false) {
  const folders = ['data', 'source']

  // check if file exists in any of the paths
  for (const folder of folders) {
    const full_path = getCachePath(null, folder, filename)

    if (fs.existsSync(full_path)) {
      return full_path
    }
  }

  return false
}
