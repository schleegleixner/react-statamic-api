'use client'

import { useEffect, useRef, useState } from 'react'
import { getLiveDataWithMeta } from '../api'
import useOnlineStatus from './useOnlineStatus'

export type LiveDataStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UseLiveDataResult<T> {
  data: T | null
  status: LiveDataStatus
  /** When the current data was fetched, in ms. `null` if unknown. */
  cached_at: number | null
  /** Absolute expiry timestamp in ms. `null` if unknown. */
  expires: number | null
  /** True when offline or the cached data is past its lifetime. */
  is_stale: boolean
  /** Reactive online flag. */
  is_online: boolean
}

/**
 * Drop-in replacement for `useApi` that additionally surfaces staleness so the
 * UI can flag live data as outdated when running offline or from an expired
 * cache. Reuses the same localStorage cache as `useApi`.
 */
export default function useLiveData<T>(
  route: string,
  lifetime: number = 30,
  auto_update: boolean = true,
): UseLiveDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<LiveDataStatus>('idle')
  const [cachedAt, setCachedAt] = useState<number | null>(null)
  const [expires, setExpires] = useState<number | null>(null)
  const [now, setNow] = useState<number>(() => Date.now())
  const isFetching = useRef(false)
  const isOnline = useOnlineStatus()

  useEffect(() => {
    const fetchData = () => {
      if (isFetching.current) {
        return
      }
      isFetching.current = true
      setStatus('loading')

      getLiveDataWithMeta<T>(route, lifetime)
        .then(result => {
          if (result.data !== null && result.data !== undefined) {
            setData(result.data)
            setCachedAt(result.cached_at)
            setExpires(result.expires)
            setStatus('success')
          } else {
            setData(null)
            setStatus('error')
          }
        })
        .catch(() => {
          setData(null)
          setStatus('error')
        })
        .finally(() => {
          isFetching.current = false
        })
    }

    fetchData()

    if (auto_update && lifetime > 0) {
      const interval = setInterval(fetchData, lifetime * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [route, lifetime, auto_update])

  // Re-evaluate staleness over time without refetching.
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 30 * 1000)
    return () => clearInterval(tick)
  }, [])

  const is_stale =
    status === 'success' && (!isOnline || (expires !== null && now > expires))

  return {
    data,
    status,
    cached_at: cachedAt,
    expires,
    is_stale,
    is_online: isOnline,
  }
}
