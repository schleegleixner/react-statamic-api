import {
  readApiCache,
  writeApiCache,
  writeBuffer,
  writeContentCache,
} from '../lib/cache'
import { fetchFile, fetchJSON, getCMSEndpoint } from '../utils/api'
import path from 'path'
import {
  ensureCacheFolder,
  moveTemporaryFolder,
  getCachePath,
} from '../utils/filesystem'
import getDataFile from '../api/getDataFile'
import { getTimeline } from '../utils/sources'
import { RebuildResult, ResultType, StepResultType } from '../types/cms'
import { PageMappingType } from '../types/pages'
import pLimit from 'p-limit'
import { sanitizeString } from '../utils/sanitize'
import { getFileContent } from '../response/responseContent'

const temporary_folder = 'temp'

function buildFullUrl(
  url: string | undefined | null,
  site_id: string = 'default',
): string | null {
  if (!url) {
    return null
  }
  if (url.startsWith('http')) {
    return url
  }
  return `/${site_id !== 'default' ? site_id : ''}/${url}`.replace(/\/+/g, '/')
}

export async function fetchFromStatamic(
  sites: string[],
): Promise<ResultType> {
  const results: StepResultType[] = []

  const rebuild_results = await rebuildCache(sites)
  const rebuild_success = rebuild_results.every(
    result => result.success === true,
  )

  results.push({
    name: 'step::rebuild',
    success: rebuild_success,
    payload: rebuild_results,
  })

  const overall_success = results.every(step => step.success)
  const message = overall_success
    ? `Success! Cache has been flushed and rebuilt.`
    : `Some steps failed. Check the results for more information.`
  const endpoint = getCMSEndpoint()

  return { message, endpoint, results, success: overall_success }
}

async function fetchFromRemote(
  site_id: string = 'default',
  content_type: string = 'content',
  collection_id?: string,
  id?: string | number,
  options?: { silentNotFound?: boolean },
): Promise<unknown | null> {
  const base_url = getCMSEndpoint()
  const parts = [content_type, collection_id, id].filter(Boolean)
  const endpoint = `${base_url}${parts.join('/')}?site_id=${site_id}&secret=${process.env.API_SECRET}`

  const payload = await fetchJSON(endpoint, {
    silentNotFound: options?.silentNotFound,
  })
  if (!payload) {
    return null
  }

  await writeContentCache(
    temporary_folder,
    content_type,
    collection_id ?? undefined,
    id ?? undefined,
    payload,
  )

  return payload
}

async function fetchContent(
  site_id: string = 'default',
  collection_id: string,
  id?: string | number,
): Promise<any> {
  const singular_id = collection_id.endsWith('s')
    ? collection_id.slice(0, -1)
    : collection_id

  return await fetchFromRemote(site_id, 'content', singular_id, id)
}

async function createPopulatedCollection(
  collection_id: string,
  site_id: string = 'default',
): Promise<any> {
  const json_data = getFileContent(temporary_folder, 'collection', collection_id, false)
  const collection = json_data?.payload
  // const collection = await getCollection(collection_id, temporary_folder)

  if (!collection) {
    // eslint-disable-next-line no-console
    console.warn(
      `⚠️ Collection not found: ${collection_id} (${temporary_folder})`,
      collection,
    )
    return null
  }

  // Statamic only returns the slug-based `url` for each entry; the parent
  // hierarchy is not pre-resolved. Walk the parent chain ourselves to build
  // the full nested path before populating entries.
  const resolved_path_by_id = new Map<string, string>()
  if (collection_id === 'pages' && Array.isArray(collection)) {
    const pages_by_id = new Map<string, any>(
      collection.map((p: any) => [p.id, p]),
    )

    const resolvePath = (entry: any, visited: Set<string>): string => {
      if (!entry?.url) return ''
      if (visited.has(entry.id)) return entry.url
      visited.add(entry.id)

      const segment = entry.url.replace(/^\/+|\/+$/g, '')
      const parent_entry = entry.parent?.id
        ? pages_by_id.get(entry.parent.id)
        : null

      if (!parent_entry) {
        return segment ? `/${segment}` : '/'
      }

      const parent_path =
        resolved_path_by_id.get(parent_entry.id) ??
        resolvePath(parent_entry, visited)

      if (!segment) return parent_path
      return parent_path === '/' ? `/${segment}` : `${parent_path}/${segment}`
    }

    for (const entry of collection) {
      if (entry?.id) {
        resolved_path_by_id.set(entry.id, resolvePath(entry, new Set()))
      }
    }
  }

  await Promise.all(
    collection.map(async (entry: any) => {
      // url rewrites (add site_id in front)
      if (entry.url) {
        entry.site_id = site_id
        const resolved_url = resolved_path_by_id.get(entry.id) ?? entry.url
        entry.full_url = buildFullUrl(resolved_url, site_id)

        if (entry.parent) {
          const parent_resolved =
            resolved_path_by_id.get(entry.parent.id) ?? entry.parent.url
          entry.parent.full_url = buildFullUrl(parent_resolved, site_id)
        }
      }

      // tiles
      if (entry.tile_id) {
        entry.content = await getFileContent(
          temporary_folder,
          'content',
          'tile',
          entry.tile_id,
        )?.payload
        if (Array.isArray(entry.content.datasources)) {
          entry.content.datasources.forEach((datasource: any) => {
            // sanitize columns
            if (Array.isArray(datasource.columns)) {
              datasource.columns = datasource.columns.map((column: any) =>
                sanitizeString(column),
              )
            }
            // sanitize table_rows keys
            if (Array.isArray(datasource.table_rows)) {
              datasource.table_rows = datasource.table_rows.map((row: any) => ({
                ...row,
                key: sanitizeString(row.key),
              }))
            }
          })
        }
      }

      // pages
      if (collection_id === 'pages') {
        entry.content = await getFileContent(temporary_folder, 'content', 'page', entry.slug)?.payload
      }

      // sources
      if (entry.file_name) {
        const content = await getDataFile(entry.file_name, temporary_folder)
        const timeline = getTimeline(content)
        entry.content = content
        entry.timeline = timeline
        entry.entry_count = timeline.length ?? 0
        entry.columns = entry.columns?.map((column: any) => {
          return sanitizeString(column)
        })
      }
    }),
  )

  await writeContentCache(
    temporary_folder,
    'collection',
    `${collection_id}.populated`,
    false,
    collection,
  )

  return collection
}

type NavItemRaw = {
  id?: string
  entry?: string
  slug?: string
  title?: string
  aria_label?: string
  target?: string
  url?: string
  children?: NavItemRaw[]
  items?: NavItemRaw[]
}

type NavItemPopulated = {
  id: string | null
  slug: string | null
  title: string | null
  aria_label: string | null
  target: string
  full_url: string | null
  children: NavItemPopulated[]
}

async function createPopulatedNavigation(
  handle: string,
  site_id: string = 'default',
): Promise<{
  handle: string
  title: string | null
  items: NavItemPopulated[]
} | null> {
  const json_data = getFileContent(temporary_folder, 'navigation', handle, false)
  const navigation = json_data?.payload

  if (!navigation) {
    // eslint-disable-next-line no-console
    console.warn(
      `⚠️ Navigation not found: ${handle} (${temporary_folder})`,
    )
    return null
  }

  const pages_data = getFileContent(
    temporary_folder,
    'collection',
    'pages.populated',
    false,
  )
  const pages: PageMappingType[] = pages_data?.payload ?? []
  const pages_by_id = new Map(pages.map(p => [p.id, p]))
  const pages_by_slug = new Map(pages.map(p => [p.slug, p]))

  // `entry` is a page id, `slug` falls back when no entry is linked
  const mapItem = (item: NavItemRaw): NavItemPopulated => {
    const page = item.entry
      ? (pages_by_id.get(item.entry) ?? pages_by_slug.get(item.entry))
      : item.slug
        ? pages_by_slug.get(item.slug)
        : undefined
    const child_items = item.children ?? item.items ?? []
    const is_external = item.url?.startsWith('http') ?? false

    return {
      id: page?.id ?? item.id ?? null,
      slug: page?.slug ?? item.slug ?? null,
      title: item.title ?? page?.title ?? null,
      aria_label: item.aria_label ?? item.title ?? page?.title ?? null,
      target: item.target ?? (is_external ? '_blank' : '_self'),
      full_url: page?.full_url ?? buildFullUrl(item.url, site_id),
      children: Array.isArray(child_items) ? child_items.map(mapItem) : [],
    }
  }

  const populated = {
    handle: navigation.handle ?? handle,
    title: navigation.title ?? null,
    items: Array.isArray(navigation.items) ? navigation.items.map(mapItem) : [],
  }

  await writeContentCache(
    temporary_folder,
    'navigation',
    `${handle}.populated`,
    false,
    populated,
  )

  return populated
}


export async function getAPI(
  api: string,
  use_cache: boolean = true,
  lifetime: number = 6 * 60,
): Promise<any> {
  const file_name = api.replace(/\//g, '_')

  if (use_cache) {
    const cache_data = (await readApiCache(file_name)) || null
    if (cache_data) {
      return cache_data
    }
  }

  // get the data from the API
  const endpoint = `${getCMSEndpoint()}${api}`
  const payload = await fetchJSON(endpoint)

  if (payload !== null) {
    // save the data to the cache
    writeApiCache(file_name, payload, lifetime)
    return payload
  }

  return null
}

async function downloadFile(
  site_id: string,
  file_path: string,
  folder: string,
): Promise<any> {
  // if endpoint has no http(s):// prefix, prepend the CMS endpoint
  const endpoint = file_path.startsWith('http')
    ? file_path
    : getCMSEndpoint(path.join(folder, file_path))
  const file_name = file_path.startsWith('http')
    ? path.basename(file_path)
    : file_path
  const content = await fetchFile(endpoint)

  if (!content) {
    return false
  }

  await writeBuffer(getCachePath(temporary_folder, folder, file_name), content)
}

// rebuild the cache for all sites
export async function rebuildCache(sites: string[]): Promise<RebuildResult[]> {
  // if no sites are defined, use a default site
  if (!sites || sites.length === 0) {
    return []
  }

  // eslint-disable-next-line no-console
  console.log('🔄 Rebuilding cache for sites:', sites)

  const results = await Promise.all(
    sites.map(async site => {
      const name = 'site::' + site
      try {
        ensureCacheFolder(temporary_folder)
        const fetch_result = await fetchForSite(site)

        // check if any step failed
        if (fetch_result.every(result => result.success === true)) {
          await moveTemporaryFolder(temporary_folder, site)
          return { name, success: true, result: fetch_result }
        }
        return { name, success: false, result: fetch_result }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`❌ Error fetching site: ${site}`, e)
        return { name, success: false, result: e }
      }
    }),
  )

  return results
}

// fetch all data for a specific site
async function fetchForSite(site_id: string) {
  const collections = process.env.SET_COLLECTIONS
    ? process.env.SET_COLLECTIONS.split(',')
    : ['pages', 'sources', 'images', 'tiles']
  const taxonomies = process.env.SET_TAXONOMIES
    ? process.env.SET_TAXONOMIES.split(',')
    : ['icons', 'action_fields', 'sdg_targets']
  const global = process.env.SET_GLOBAL
    ? process.env.SET_GLOBAL.split(',')
    : ['seo', 'footer', 'strings']
  const data: any = {}
  const results: RebuildResult[] = []

  const limit = pLimit(10) // limit concurrent requests

  const collection_results = await Promise.all(
    collections.map(c => fetchFromRemote(site_id, 'collection', c)),
  )
  collections.forEach((c, i) => (data[c] = collection_results[i]))

  const tasks_content: Promise<any>[] = []
  const tasks_files: Promise<any>[] = []
  let navigation_handles: string[] = []

    ; (data.tiles ?? []).forEach((tile: { tile_id: string }) =>
      tasks_content.push(
        limit(() =>
          fetchContent(site_id, 'tile', tile.tile_id).then(r =>
            results.push({ name: 'tile::' + tile.tile_id, success: !!r }),
          ),
        ),
      ),
    )
    ; (data.pages ?? []).forEach((page: { slug: string }) =>
      tasks_content.push(
        limit(() =>
          fetchContent(site_id, 'page', page.slug).then(r =>
            results.push({ name: 'page::' + page.slug, success: !!r }),
          ),
        ),
      ),
    )

  taxonomies.forEach(t =>
    tasks_content.push(
      limit(() =>
        fetchFromRemote(site_id, 'taxonomy', t).then(r =>
          results.push({ name: 'taxonomy::' + t, success: !!r }),
        ),
      ),
    ),
  )

  global.forEach(g =>
    tasks_content.push(
      limit(() =>
        fetchFromRemote(site_id, 'global', g).then(r =>
          results.push({ name: 'global::' + g, success: !!r }),
        ),
      ),
    ),
  )

  tasks_content.push(
    limit(async () => {
      const list_payload = (await fetchFromRemote(
        site_id,
        'navigation',
        undefined,
        undefined,
        { silentNotFound: true },
      )) as { handle: string }[] | null
      // navigation list is optional (silentNotFound); a missing list must not
      // fail the rebuild and block moveTemporaryFolder from running
      results.push({ name: 'navigation::list', success: true })
      navigation_handles = (list_payload ?? []).map(({ handle }) => handle)
      await Promise.all(
        navigation_handles.map(handle =>
          limit(() =>
            fetchFromRemote(site_id, 'navigation', handle, undefined, {
              silentNotFound: true,
            }).then(r =>
              results.push({ name: 'navigation::' + handle, success: !!r }),
            ),
          ),
        ),
      )
    }),
  )

    // only download images and sources for the default site
    ; (data.images ?? []).forEach((image: { url: string; file_name: string }) =>
      tasks_files.push(
        limit(() =>
          downloadFile(site_id, image.url, 'images').then(r =>
            results.push({
              name: 'image::' + image.file_name,
              success: r !== null,
            }),
          ),
        ),
      ),
    )
    ; (data.sources ?? []).forEach((source: { url: string; file_name: string }) =>
      tasks_files.push(
        limit(() =>
          downloadFile(site_id, source.url, 'source').then(r =>
            results.push({
              name: 'source::' + source.file_name,
              success: r !== null,
            }),
          ),
        ),
      ),
    )

  // eslint-disable-next-line no-console
  console.log(
    `ℹ️ Fetching content for site: ${site_id}, tasks: ${tasks_content.length}`,
  )
  await Promise.all(tasks_content)

  // eslint-disable-next-line no-console
  console.log(
    `ℹ️ Fetching files for site: ${site_id}, tasks: ${tasks_files.length}`,
  )
  await Promise.all(tasks_files)

  // eslint-disable-next-line no-console
  console.log(`ℹ️ Fetched ${results.length} items for site: ${site_id}`)

  for (const c of collections) {
    // eslint-disable-next-line no-console
    console.log(`ℹ️ Creating populated collection: ${c} (${site_id})`)
    const result = await createPopulatedCollection(c, site_id)
    results.push({
      name: 'populated_collection::' + c,
      success: result !== null,
    })
  }

  // eslint-disable-next-line no-console
  console.log(`ℹ️ Creating populated navigation: ${navigation_handles.length} (${site_id})`)

  for (const handle of navigation_handles) {
    // eslint-disable-next-line no-console
    console.log(`ℹ️ Creating populated navigation: ${handle} (${site_id})`)
    const result = await createPopulatedNavigation(handle, site_id)
    results.push({
      name: 'populated_navigation::' + handle,
      success: result !== null,
    })
  }

  return results
}
