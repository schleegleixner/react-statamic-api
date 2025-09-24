import { getPopulatedCollection } from '../lib/content'

export default async function getPageData(id: string, site_id?: string) {
  const collection = await getPopulatedCollection('pages', site_id)

  // find page in collection
  if (collection && collection.length > 0) {
    const page = collection.find((item: any) => item.slug === id)
    if (page) {
      return page
    }
  }

  return null
}
