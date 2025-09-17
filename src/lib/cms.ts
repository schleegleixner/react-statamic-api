import {
  readApiCache,
  writeApiCache,
  writeBuffer,
  writeContentCache,
} from '../lib/cache'
import { fetchFile, fetchJSON, getCMSEndpoint } from '../utils/api'
import path from 'path'
import { getCachePath } from '../utils/filesystem'
import getDataSource from '../api/getDataSource'
import { getTimeline } from '../utils/sources'
import { getCollection, getContent } from '../lib/content'
import { ResultType, StepResultType } from '../types/cms'
import { flushCache, revalidateContent } from './cache'

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
        const content = await getDataSource(entry.file_name)
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

  for (const collection of collections) {
    // get the collection data
    data[collection] = await fetchFromRemote('collection', collection)
  }

  // rebuild content
  try {
    for (const tile of data.tiles ?? []) {
      const result = await fetchContent('tile', tile.tile_id)
      results.push({ name: 'tile::' + tile.tile_id, success: !!result })
    }
    for (const page of data.pages ?? []) {
      const result = await fetchContent('page', page.slug)
      results.push({ name: 'page::' + page.slug, success: !!result })
    }
    for (const image of data.images ?? []) {
      const result = await downloadFile(image.url, 'images')
      results.push({
        name: 'image::' + image.file_name,
        success: result !== null,
      })
    }
    for (const source of data.sources ?? []) {
      const result = await downloadFile(source.url, 'source')
      results.push({
        name: 'source::' + source.file_name,
        success: result !== null,
      })
    }

    // get all taxonomy
    for (const taxonomy_id of taxonomies) {
      const result = await fetchFromRemote('taxonomy', taxonomy_id)
      results.push({ name: 'taxonomy::' + taxonomy_id, success: !!result })
    }

    // get all global data
    for (const global_id of global) {
      const result = await fetchFromRemote('global', global_id)
      results.push({ name: 'global::' + global_id, success: !!result })
    }

    // rebuild collections
    for (const collection of collections) {
      createPopulatedCollection(collection)
    }

    return results
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Rebuild cache error:', error)
    return false
  }
}
