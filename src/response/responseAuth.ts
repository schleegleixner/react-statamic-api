import { NextRequest, NextResponse } from 'next/server'

export default async function responseAuth(req: NextRequest): Promise<Response> {
  const { password } = await req.json()
  const host = req.headers.get('host') || 'localhost:3000'
  const is_secure = !host.includes('localhost') && !host.includes('127.0.0.1')
  const is_iframe = req.headers.get('Sec-Fetch-Dest') === 'iframe'
  const is_insecure_iframe = is_iframe && !is_secure

  if (password === process.env.PASSWORD) {
    const response = NextResponse.json({
      success: true,
      skipCookie: is_insecure_iframe  // skip it
    })

    // set cookie only if it works
    if (!is_insecure_iframe) {
      response.cookies.set('site_auth', password, {
        path: '/',
        httpOnly: true,
        secure: is_secure,
        sameSite: is_secure ? 'none' : 'lax',
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    return response
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
