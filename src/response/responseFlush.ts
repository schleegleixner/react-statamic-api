import { checkSecret } from '../utils/api'
import { fetchFromStatamic } from '../lib/cms'

function withCors(
  body: BodyInit | null,
  status: number,
  extra_headers: HeadersInit = {},
) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...extra_headers,
    },
  })
}

export default async function responseFlush(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret') ?? ''

  if (!checkSecret(secret)) {
    return withCors(JSON.stringify({ message: 'Unauthorized' }), 401)
  }

  const result = await fetchFromStatamic()
  return withCors(JSON.stringify(result), 200)
}

export async function OPTIONS(): Promise<Response> {
  return withCors(null, 204)
}
