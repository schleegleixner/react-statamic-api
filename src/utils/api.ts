import { NextApiRequest } from 'next'
import axios from 'axios'
import https from 'https'

// checkSecret with req parameter
export function checkSecret(req: NextApiRequest): boolean {
  const { secret } = req.query
  const api_secret = process.env.API_SECRET

  if (!api_secret) {
    return false
  }

  return typeof secret === 'string' && secret === api_secret
}

export function getCMSEndpoint(url = ''): string {
  const endpoint = process.env.SSD_API + url
  return endpoint.replace(/([^:]\/)\/+/g, '$1') // remove double slashes
}

export function getCacheEndpoint(url = ''): string {
  const endpoint = process.env.NEXT_PUBLIC_URL + '/api/' + url
  return endpoint.replace(/([^:]\/)\/+/g, '$1') // remove double slashes
}

export async function fetchJSON(endpoint: string): Promise<any> {
  const timeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 5000

  const agent = new https.Agent({
    rejectUnauthorized: false,
  })

  try {
    const response = await axios.get(endpoint.replace(/([^:]\/)\/+/g, '$1'), {
      timeout,
      httpsAgent: agent,
    })

    if (response?.data?.result === 'success' || response?.status === 200) {
      return response?.data?.payload ?? response?.data
    }

    return null
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('fetchJSON error:', error)
    return null
  }
}

export async function fetchFile(endpoint: string): Promise<Buffer | null> {
  try {
    const response = await fetch(endpoint, {
      next: { tags: ['cached_files'] },
    })

    if (response.status !== 200) {
      return null
    }

    const array_buffer = await response.arrayBuffer()
    return Buffer.from(array_buffer)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('fetchFile error:', error)
    return null
  }
}
