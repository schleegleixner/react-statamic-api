import { getCachedData } from '../lib/content'

export default async function getPageData(
  id: string,
  locale: string = 'default',
  default_value: any = [],
) {
  const data = await getCachedData(
    `content?collection=page&id=${id}&locale=${locale}`,
  )

  return data || default_value
}
