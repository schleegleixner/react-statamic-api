import { NextResponse } from 'next/server'

export default async function responseAuth(req: Request): Promise<Response> {
  const { password } = await req.json()

  if (password === process.env.PASSWORD) {
    const response = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
    })
    response.cookies.set('site_auth', password, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    return response
  }

  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
  })
}
