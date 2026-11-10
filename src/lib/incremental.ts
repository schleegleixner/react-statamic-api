import fs from 'fs'
import path from 'path'
import { getCachePath, getCacheRootPath, removePath } from '../utils/filesystem'
import { FlushChanges, FlushRelease, RebuildMode } from '../types/cms'

const release_file = 'release.json'

function toString(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined
}

function toList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

// Read the release info from a flush request body. Anything malformed is
// dropped, which results in a full rebuild.
export function parseRelease(body: any): FlushRelease {
  const changes = body?.changes
  const has_changes =
    changes !== null && typeof changes === 'object' && !Array.isArray(changes)

  return {
    base: toString(body?.base),
    release: toString(body?.release),
    changes: has_changes
      ? {
          tiles: toList(changes.tiles),
          sources: toList(changes.sources),
          images: toList(changes.images),
        }
      : undefined,
  }
}

// Release id the cache of a site currently represents, or null when unknown.
export function readRelease(site_id: string): string | null {
  try {
    const json = JSON.parse(
      fs.readFileSync(`${getCacheRootPath(site_id)}/${release_file}`, 'utf8'),
    )
    return toString(json?.release) ?? null
  } catch {
    return null
  }
}

// Stamp a cache folder with its release. Without a release the stamp is
// removed, so the next flush can't mistake the folder for a known base.
export function writeRelease(folder: string, release?: string): void {
  const file_path = `${getCacheRootPath(folder)}/${release_file}`

  if (!release) {
    removePath(file_path)
    return
  }

  fs.writeFileSync(
    file_path,
    JSON.stringify({ release, updated_at: new Date().toISOString() }),
  )
}

// Set up a clean temporary folder for a site. The change list is only used
// when the live cache exists and is exactly the release the list was built
// against; then the cache is copied and patched. Otherwise start empty.
export function prepareTemporaryFolder(
  temporary_folder: string,
  site_id: string,
  release: FlushRelease,
): RebuildMode {
  const temp_path = getCacheRootPath(temporary_folder)
  const site_path = getCacheRootPath(site_id)

  // leftovers of a failed run must never leak into the next cache
  removePath(temp_path)

  const is_incremental =
    !!release.changes &&
    !!release.base &&
    fs.existsSync(site_path) &&
    readRelease(site_id) === release.base

  if (is_incremental) {
    fs.cpSync(site_path, temp_path, { recursive: true, dereference: true })
    return 'incremental'
  }

  fs.mkdirSync(temp_path, { recursive: true })
  return 'full'
}

// File name a download is stored under (see downloadFile).
export function fileNameFromPath(file_path: string): string {
  return file_path.startsWith('http') ? path.basename(file_path) : file_path
}

// Whether an item has to be (re)transferred: listed as changed, or missing
// from the copied cache for whatever reason.
export function needsTransfer(
  changes: FlushChanges | undefined,
  key: keyof FlushChanges,
  id: string,
  cached_path: string,
): boolean {
  return !changes || changes[key].includes(id) || !fs.existsSync(cached_path)
}

function pruneFolder(folder_path: string, keep: string[]): void {
  if (!fs.existsSync(folder_path)) {
    return
  }

  const keep_set = new Set(keep)

  for (const entry of fs.readdirSync(folder_path, { withFileTypes: true })) {
    if (entry.isFile() && !keep_set.has(entry.name)) {
      fs.rmSync(path.join(folder_path, entry.name), { force: true })
    }
  }
}

// Remove cached items that are no longer part of the freshly fetched lists
// (deleted, unpublished or renamed). Lists that failed to load are skipped.
export function pruneOrphans(temporary_folder: string, data: any): void {
  const prune = (
    list: unknown,
    content_type: string,
    folder: string | false,
    toFileName: (item: any) => string | undefined,
  ) => {
    if (!Array.isArray(list)) {
      return
    }
    pruneFolder(
      getCachePath(temporary_folder, content_type, folder),
      list.map(toFileName).filter((name): name is string => !!name),
    )
  }

  prune(
    data.tiles,
    'content',
    'tile',
    tile => tile?.tile_id && `${tile.tile_id}.json`,
  )
  prune(
    data.pages,
    'content',
    'page',
    page => page?.slug && `${page.slug}.json`,
  )
  prune(
    data.images,
    'images',
    false,
    image => image?.url && fileNameFromPath(image.url),
  )
  prune(
    data.sources,
    'source',
    false,
    source => source?.url && fileNameFromPath(source.url),
  )
}
