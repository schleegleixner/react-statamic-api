import getProcessedImageData from '../server/getProcessedImageData'

export default async function responseImage(
  name: string,
  req: Request,
  sharp: any,
): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const w = searchParams.get('w') ?? '1200'
  const h = searchParams.get('h') ?? undefined
  const q = searchParams.get('q') ?? '75'

  const width = +w // ensure width is a number
  const height = h !== undefined ? +h : undefined // ensure height is a number or undefined
  const quality = +q // ensure quality is a number

  const file_name: string | null = Array.isArray(name)
    ? (name[0] ?? null)
    : name // ensure name is string

  if (!file_name) {
    return new Response(null, {
      status: 404,
    })
  }

  const result = await getProcessedImageData(
    sharp,
    file_name,
    width,
    height,
    quality,
  )

  if (!result) {
    return new Response(null, {
      status: 404,
    })
  }

  const mime_type = await sharp(result)
    .metadata()
    .then((m: { format?: string }) => m.format ?? 'jpeg')

  return new Response(new Uint8Array(result), {
    status: 200,
    headers: {
      'X-Cache': 'MISS',
      'Content-Type': 'image/' + mime_type,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
