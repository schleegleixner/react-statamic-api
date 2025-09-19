import { getPopulatedCollection } from '../lib/content'

export default async function getPageData(
  id: string,
  locale: string = 'default',
  default_value: any = [],
) {
  const collection = await getPopulatedCollection('pages', locale)

  // find page in collection
  if (collection && collection.length > 0) {
    const page = collection.find((item: any) => item.slug === id)
    if (page) {
      return page
    }
  }

  return default_value
}
