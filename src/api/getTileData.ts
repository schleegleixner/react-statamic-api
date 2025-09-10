import { getCachedData } from '../lib/content'

export default async function getTileData(
  id: string,
  attribute: string | false = false,
  default_value: any = [],
) {
  const data = await getCachedData(`content?collection=tile&id=${id}`)

  if (attribute !== false) {
    return data && data[attribute] ? data[attribute] : default_value
  }

  return data || default_value
}
