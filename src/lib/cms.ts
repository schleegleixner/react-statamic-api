import {
  readApiCache,
  writeApiCache,
  writeBuffer,
  writeContentCache,
} from '../lib/cache'
import { fetchFile, fetchJSON, getCMSEndpoint } from '../utils/api'
import path from 'path'
import { getCachePath } from '../utils/filesystem'
import getDataFile from '../api/getDataFile'
import { getTimeline } from '../utils/sources'
import { getCollection, getContent } from '../lib/content'
import {
  RebuildResult,
  ResultType,
  SiteType,
  StepResultType,
} from '../types/cms'
import { flushCache, revalidateContent } from './cache'
import pLimit from 'p-limit'

export async function fetchFromStatamic(): Promise<ResultType> {
  const results: StepResultType[] = []

  const flushResult = await flushCache()

  results.push({ name: 'flush', success: flushResult === true })

  const rebuildResult = await rebuildCache()
  results.push({
    name: 'rebuild',
    success: rebuildResult !== false,
    payload: rebuildResult,
  })

  const revalidationResult = await revalidateContent()
  if (!revalidationResult.success) {
    results.push({
      name: 'revalidation',
      success: false,
      error: revalidationResult.error,
    })
  } else {
    results.push({ name: 'revalidation', success: true })
  }

  const overallSuccess = results.every(step => step.success)
  const message = overallSuccess
    ? 'Success! Cache has been flushed and rebuilt.'
    : 'Some steps failed. Check the results for more information.'

  return { message, results, success: overallSuccess }
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
    site_id,
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
  site_id: string = 'default',
  collection_id: string,
): Promise<any> {
  const collection = await getCollection(collection_id, site_id)

  if (!collection) {
    // eslint-disable-next-line no-console
    console.warn(
      `⚠️ Collection not found: ${collection_id} (${site_id})`,
      collection,
    )
    return null
  }

  await Promise.all(
    collection.map(async (entry: any) => {
      // url rewrites (add site_id in front)
      if (entry.url) {
        entry.site_id = site_id
        entry.full_url =
          `/${site_id !== 'default' ? site_id : ''}/${entry.url}`.replace(
            /\/+/g,
            '/',
          )
        if (entry.parent) {
          entry.parent.full_url =
            `/${site_id !== 'default' ? site_id : ''}/${entry.parent.url}`.replace(
              /\/+/g,
              '/',
            )
        }
      }

      // tiles
      if (entry.tile_id) {
        entry.content = await getContent(collection_id, entry.tile_id, site_id)
      }

      // pages
      if (collection_id === 'pages') {
        entry.content = await getContent('pages', entry.slug, site_id)
      }

      // sources
      if (entry.file_name) {
        const content = await getDataFile(entry.file_name)
        const timeline = getTimeline(content)
        entry.content = content
        entry.timeline = timeline
        entry.entry_count = timeline.length ?? 0
      }
    }),
  )

  await writeContentCache(
    site_id,
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

async function downloadFile(file_path: string, folder: string): Promise<any> {
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

  await writeBuffer(getCachePath(null, folder, file_name), content)
}

// rebuild the cache for all sites
export async function rebuildCache() {
  const sites = (await fetchFromRemote('default', 'sites')) as SiteType[]

  // if no sites are defined, use a default site
  if (!sites) {
    return false
  }

  const results = await Promise.all(
    sites.map(async site => {
      try {
        const fetch_result = await fetchForSite(site.handle)
        return { site_id: site.handle, result: fetch_result }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`❌ Error fetching site: ${site.handle}`, e)
        return { name: 'site::' + site.handle, success: false, error: e }
      }
    }),
  )

  return results
}

// fetch all data for a specific site
async function fetchForSite(site_id: string) {
  const collections = ['pages', 'sources', 'images', 'tiles']
  const taxonomies = ['icons', 'action_fields', 'sdg_targets']
  const global = ['seo', 'footer', 'strings']
  const data: any = {}
  const results: RebuildResult[] = []

  const limit = pLimit(10) // limit concurrent requests

  const collection_results = await Promise.all(
    collections.map(c => fetchFromRemote(site_id, 'collection', c)),
  )
  collections.forEach((c, i) => (data[c] = collection_results[i]))

  const tasks_content: Promise<any>[] = []
  const tasks_files: Promise<any>[] = []

  ;(data.tiles ?? []).forEach((tile: { tile_id: string }) =>
    tasks_content.push(
      limit(() =>
        fetchContent(site_id, 'tile', tile.tile_id).then(r =>
          results.push({ name: 'tile::' + tile.tile_id, success: !!r }),
        ),
      ),
    ),
  )
  ;(data.pages ?? []).forEach((page: { slug: string }) =>
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
  if (site_id === 'default') {
    ;(data.images ?? []).forEach((image: { url: string; file_name: string }) =>
      tasks_files.push(
        limit(() =>
          downloadFile(image.url, 'images').then(r =>
            results.push({
              name: 'image::' + image.file_name,
              success: r !== null,
            }),
          ),
        ),
      ),
    )
    ;(data.sources ?? []).forEach(
      (source: { url: string; file_name: string }) =>
        tasks_files.push(
          limit(() =>
            downloadFile(source.url, 'source').then(r =>
              results.push({
                name: 'source::' + source.file_name,
                success: r !== null,
              }),
            ),
          ),
        ),
    )
  }

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
    await createPopulatedCollection(site_id, c)
  }

  return results
}
