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
import { ResultType, StepResultType } from '../types/cms'
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
  content_type: string = 'content',
  collection_id: string = 'tile',
  id: string | number | boolean = false,
): Promise<any> {
  // get the data from the API
  const endpoint = `${getCMSEndpoint()}${content_type}/${collection_id}${
    id ? `/${id}` : ''
  }`
  const payload = await fetchJSON(endpoint) // fetch the data from the API

  if (payload) {
    // save the data to the cache
    await writeContentCache(content_type, collection_id, id, payload)
    return payload
  }

  return null
}

async function fetchContent(
  collection_id: string = 'tiles',
  id: string | number | boolean = false,
): Promise<any> {
  const singular_id = collection_id.endsWith('s')
    ? collection_id.slice(0, -1)
    : collection_id

  return await fetchFromRemote('content', singular_id, id)
}

async function createPopulatedCollection(
  collection_id: string = 'tiles',
): Promise<any> {
  const collection = await getCollection(collection_id)

  await Promise.all(
    collection.map(async (entry: any) => {
      // tiles
      if (entry.tile_id) {
        entry.content = await getContent(collection_id, entry.tile_id)
      }

      // pages
      if (collection_id === 'pages') {
        entry.content = await getContent('pages', entry.slug)
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
  console.log('Fetching API:', endpoint)
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

type RebuildResult = {
  name: string
  success: boolean
}

export async function rebuildCache() {
  const collections = ['pages', 'sources', 'images', 'tiles']
  const taxonomies = ['icons', 'action_fields', 'sdg_targets']
  const global = ['seo', 'footer']
  const data: any = {}
  const results: RebuildResult[] = []

  const limit = pLimit(10) // limit concurrent requests

  const collection_results = await Promise.all(
    collections.map(c => fetchFromRemote('collection', c)),
  )
  collections.forEach((c, i) => (data[c] = collection_results[i]))

  try {
    const tasks: Promise<any>[] = []

    ;(data.tiles ?? []).forEach((tile: { tile_id: string }) =>
      tasks.push(
        limit(() =>
          fetchContent('tile', tile.tile_id).then(r =>
            results.push({ name: 'tile::' + tile.tile_id, success: !!r }),
          ),
        ),
      ),
    )
    ;(data.pages ?? []).forEach((page: { slug: string }) =>
      tasks.push(
        limit(() =>
          fetchContent('page', page.slug).then(r =>
            results.push({ name: 'page::' + page.slug, success: !!r }),
          ),
        ),
      ),
    )
    ;(data.images ?? []).forEach((image: { url: string; file_name: string }) =>
      tasks.push(
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
        tasks.push(
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

    taxonomies.forEach(t =>
      tasks.push(
        limit(() =>
          fetchFromRemote('taxonomy', t).then(r =>
            results.push({ name: 'taxonomy::' + t, success: !!r }),
          ),
        ),
      ),
    )

    global.forEach(g =>
      tasks.push(
        limit(() =>
          fetchFromRemote('global', g).then(r =>
            results.push({ name: 'global::' + g, success: !!r }),
          ),
        ),
      ),
    )

    await Promise.all(tasks)

    collections.forEach(c => createPopulatedCollection(c))

    return results
  } catch (error) {
    console.error('Rebuild cache error:', error)
    return false
  }
}
