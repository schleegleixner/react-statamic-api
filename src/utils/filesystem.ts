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

function getVersionsPath(site_id: string): string {
  return [process.cwd(), cache_folder, 'versions', site_id].join('/')
}

function supportsSymlinks(): boolean {
  const cache_path = [process.cwd(), cache_folder].join('/')
  const test_link = `${cache_path}/.symlink_test`

  try {
    if (!fs.existsSync(cache_path)) {
      fs.mkdirSync(cache_path, { recursive: true })
    }
    fs.symlinkSync('.', test_link)
    fs.unlinkSync(test_link)
    return true
  } catch {
    return false
  }
}

function removePath(target: string): void {
  try {
    const stats = fs.lstatSync(target)
    if (stats.isSymbolicLink()) {
      fs.unlinkSync(target)
    } else {
      fs.rmSync(target, { recursive: true, force: true })
    }
  } catch {
    // path doesn't exist, nothing to remove
  }
}

function cleanupOldVersions(site_id: string, keep: number = 10): void {
  const versions_path = getVersionsPath(site_id)

  if (!fs.existsSync(versions_path)) {
    return
  }

  const entries = fs.readdirSync(versions_path).sort()

  if (entries.length <= keep) {
    return
  }

  const to_remove = entries.slice(0, entries.length - keep)
  for (const entry of to_remove) {
    fs.rmSync(`${versions_path}/${entry}`, { recursive: true, force: true })
  }
}

export async function moveTemporaryFolder(
  temporary_folder: string,
  site_id: string,
): Promise<boolean> {
  const temp_path = getCacheRootPath(temporary_folder)
  const site_path = getCacheRootPath(site_id)

  try {
    if (supportsSymlinks()) {
      const timestamp = Math.floor(Date.now() / 1000)
      const versions_path = getVersionsPath(site_id)
      const version_path = `${versions_path}/${timestamp}`

      // create versioned directory
      fs.mkdirSync(version_path, { recursive: true })

      // copy temp content to versioned folder
      fs.cpSync(temp_path, version_path, { recursive: true, force: true })

      // remove temp folder
      fs.rmSync(temp_path, { recursive: true, force: true })

      // remove existing site_path (symlink or folder)
      removePath(site_path)

      // create symlink: site_path → versions/{site_id}/{timestamp}
      const relative_target = `versions/${site_id}/${timestamp}`
      fs.symlinkSync(relative_target, site_path)

      // keep only the last 10 versions
      cleanupOldVersions(site_id, 10)

      console.log(
        `💀 Moved cache to version '${timestamp}' for site '${site_id}' (symlinked)`,
      )

      return true
    }

    // fallback: direct move (no symlink support)
    if (fs.existsSync(site_path)) {
      fs.rmSync(site_path, { recursive: true, force: true })
    }

    fs.mkdirSync(site_path, { recursive: true })
    fs.cpSync(temp_path, site_path, { recursive: true, force: true })
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
