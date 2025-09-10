import { getCachedData } from '../lib/content'

export default async function getPageData(id: string, default_value: any = []) {
  const data = await getCachedData(`content?collection=page&id=${id}`)

  return data || default_value
}
