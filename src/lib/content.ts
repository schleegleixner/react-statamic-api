import url from 'url'
import { readCache } from '../lib/cache'
import { fetchJSON, getCacheEndpoint } from '../utils/api'
import { TileDatasourceType, TileDataType } from '../types/tiles'
import { readLocalStorage, writeLocalStorage } from '../utils/localstorage'
import { ImageMetaInterface } from '../types/files'

async function handleRequest(
  content_type: string = 'content',
  collection_id: string = 'tile',
  id: string | number | boolean = false,
): Promise<any> {
  const key = content_type + '.' + collection_id + '.' + id
  let cache_data = readLocalStorage(key)

  if (!cache_data) {
    cache_data = (await readCache(content_type, collection_id, id)) || null
  }

  if (cache_data) {
    writeLocalStorage(key, cache_data, 15) // cache for 15 minutes
    return cache_data // return the cached data
  }

  return null
}

export async function getContent(
  collection_id: string = 'tiles',
  id: string | number | boolean = false,
): Promise<any> {
  const singular_id = collection_id.endsWith('s')
    ? collection_id.slice(0, -1)
    : collection_id

  return await handleRequest('content', singular_id, id)
}

export async function getGlobal(global_id: string): Promise<any> {
  return handleRequest('global', global_id)
}

export async function getTaxonomy(taxonomy_id: string): Promise<any> {
  return handleRequest('taxonomy', taxonomy_id)
}

export async function getCollection(
  collection_id: string = 'tiles',
): Promise<any> {
  return handleRequest('collection', collection_id)
}

export async function getPopulatedCollection(
  collection_id: string = 'tiles',
): Promise<any> {
  const cache_data =
    (await readCache('collection', `${collection_id}.populated`)) || null
  if (cache_data) {
    return cache_data // return the cached data
  }

  return null
}

// request data from the cache (if available)
export async function getCachedData(api: string): Promise<any> {
  const api_endpoint = getCacheEndpoint(api)

  // server side rendering
  if (typeof window === 'undefined') {
    try {
      const parsedUrl = url.parse(api, true)
      const { collection, id } = parsedUrl.query

      const response = (await getContent(
        collection as string,
        id as string,
      )) as any
      return response || null
    } catch {
      return null
    }
  }

  // client request
  try {
    const response = (await fetchJSON(api_endpoint)) as any

    return response || null
  } catch {
    return null
  }
}

export async function getCompleteTileset(): Promise<TileDataType[]> {
  const collection = (await getPopulatedCollection('tiles')) as TileDataType[]
  const sources = (await getPopulatedCollection(
    'sources',
  )) as TileDatasourceType[]

  if (
    !collection ||
    !sources ||
    collection.length === 0 ||
    sources.length === 0
  ) {
    return []
  }

  // enrich tiles with sources
  const updated_collection = collection.map(tile => {
    if (tile.content?.datasources) {
      const enriched_datasources = tile.content.datasources.map(datasource => {
        const source = sources.find(
          src => src.file_name === datasource.file_name,
        )
        return {
          ...datasource,
          ...source,
        }
      })

      return {
        ...tile,
        content: {
          ...tile.content,
          datasources: enriched_datasources,
        },
      }
    }

    return tile
  })

  return updated_collection
}

export async function getImageMeta(
  file_name: string,
): Promise<ImageMetaInterface | false> {
  let images = readLocalStorage('collection.images') as ImageMetaInterface[]
  if (!images) {
    images = (await getCollection('images')) as ImageMetaInterface[]
    if (images) {
      writeLocalStorage('collection.images', images, 60) // cache for 1 hour
    }
  }

  if (!images || images.length === 0) {
    return false
  }

  const image = images.find(
    (img: ImageMetaInterface) => img.file_name === file_name,
  )

  return image ?? false
}
