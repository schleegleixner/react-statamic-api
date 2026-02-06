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
import { getCollection, getContent } from '../lib/content'
import { RebuildResult, ResultType, StepResultType } from '../types/cms'
import { revalidateContent } from './cache'
import pLimit from 'p-limit'
import { sanitizeString } from '../utils/sanitize'

const temporary_folder = 'temp'

export async function fetchFromStatamic(sites: string[]): Promise<ResultType> {
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

  if (rebuild_success) {
    const revalidation_result = await revalidateContent()
    if (!revalidation_result.success) {
      results.push({
        name: 'step::revalidation',
        success: false,
        error: revalidation_result.error,
      })
    } else {
      results.push({ name: 'step::revalidation', success: true })
    }
  }

  const overall_success = results.every(step => step.success)
  const message = overall_success
    ? `Success! Cache has been flushed and rebuilt. CMS target URL: ${getCMSEndpoint()}`
    : `Some steps failed. Check the results for more information. CMS target URL: ${getCMSEndpoint()}`

  return { message, results, success: overall_success }
}

async function fetchFromRemote(
  site_id: string = 'default',
  content_type: string = 'content',
  collection_id?: string,
  id?: string | number,
): Promise<unknown | null> {
  const base_url = getCMSEndpoint()
  const parts = [content_type, collection_id, id].filter(Boolean)
  const endpoint = `${base_url}${parts.join('/')}?site_id=${site_id}`

  const payload = await fetchJSON(endpoint)
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
  const collection = await getCollection(collection_id, temporary_folder)

  if (!collection) {
    // eslint-disable-next-line no-console
    console.warn(
      `⚠️ Collection not found: ${collection_id} (${temporary_folder})`,
      collection,
    )
    return null
  }

  await Promise.all(
    collection.map(async (entry: any) => {
      // url rewrites (add site_id in front)
      if (entry.url) {
        entry.site_id = site_id

        // construct the full URL
        entry.full_url = entry.url.startsWith('http')
          ? entry.url
          : `/${site_id !== 'default' ? site_id : ''}/${entry.url}`.replace(
            /\/+/g,
            '/',
          )

        if (entry.parent) {
          entry.parent.full_url = entry.parent.url.startsWith('http')
            ? entry.parent.url
            : `/${site_id !== 'default' ? site_id : ''}/${entry.parent.url}`.replace(
              /\/+/g,
              '/',
            )
        }
      }

      // tiles
      if (entry.tile_id) {
        entry.content = await getContent(
          collection_id,
          entry.tile_id,
          temporary_folder,
        )
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
        entry.content = await getContent('pages', entry.slug, temporary_folder)
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
          moveTemporaryFolder(temporary_folder, site)
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

  return results
}
