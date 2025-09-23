import { getAPI } from '../lib/cms'

export default async function responseLiveData(
  req: Request,
): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const route = searchParams.get('route')
  const lifetime = parseInt(searchParams.get('lifetime') as string, 10)

  if (!route) {
    return new Response(null, {
      status: 404,
    })
  }

  try {
    const data = await getAPI(route, true, lifetime)

    if (data === null || data === '') {
      return new Response(null, {
        status: 404,
      })
    }

    return new Response(JSON.stringify(data.payload ?? data), {
      status: 200,
    })
  } catch {
    return new Response(null, {
      status: 404,
    })
  }
}
