import fs from 'fs'
import { getCachedFilePath } from '../utils/filesystem'

const parseBooleanOrString = (value: string | null): boolean | string => {
  if (value === null) {
    return ''
  }
  return value === 'true' ? true : value === 'false' ? false : value
}

export default async function responseFromCache(
  req: Request,
): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const content_type = searchParams.get('content_type') ?? 'content'
  const folder = parseBooleanOrString(searchParams.get('folder'))
  const id = parseBooleanOrString(searchParams.get('id'))
  const ignore_stale = searchParams.get('ignore_stale') === 'true'

  try {
    const cache_path = getCachedFilePath(content_type, folder, id)

    if (!fs.existsSync(cache_path)) {
      return new Response(null, {
        status: 404,
      })
    }

    const cache_data = fs.readFileSync(cache_path, 'utf8')
    const json_data = JSON.parse(cache_data)

    if (!ignore_stale && json_data.expiry && Date.now() > json_data?.expiry) {
      return new Response(null, { status: 410 })
    }

    return new Response(JSON.stringify(json_data.payload ?? json_data), {
      status: 200,
    })
  } catch {
    return new Response(null, {
      status: 404,
    })
  }
}
