import { checkSecret } from '../utils/api'
import { fetchFromStatamic } from '../lib/cms'

export default async function responseFlush(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret') ?? ''

  if (!checkSecret(secret)) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
    })
  }

  const result = await fetchFromStatamic()

  return new Response(JSON.stringify(result), {
    status: 200,
  })
}
