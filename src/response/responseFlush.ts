import { checkSecret } from '../utils/api'
import { fetchFromStatamic } from '../lib/cms'
import { parseRelease } from '../lib/incremental'

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
  let body: any = null

  // sites and release info come from the JSON body (optional)
  try {
    body = await req.json()
  } catch {
    body = null
  }

  const sites: string[] = Array.isArray(body?.sites)
    ? body.sites
    : (process.env.SITE_IDS?.split(',') ?? ['default'])

  if (!checkSecret(secret)) {
    return withCors(JSON.stringify({ message: 'Unauthorized' }), 401)
  }

  const result = await fetchFromStatamic(sites, parseRelease(body))
  return withCors(JSON.stringify(result), 200)
}

export async function OPTIONS(): Promise<Response> {
  return withCors(null, 204)
}
