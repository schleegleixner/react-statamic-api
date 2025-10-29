'use client'

import { useEffect, useRef, useState } from 'react'
import { getLiveData } from '../api'

export default function useApi<T>(
  route: string,
  lifetime: number = 30,
  auto_update: boolean = true,
) {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const isFetching = useRef(false)

  useEffect(() => {
    const fetchData = () => {
      if (isFetching.current) {
        return
      }

      isFetching.current = true
      setStatus('loading')

      getLiveData(route, lifetime)
        .then(result => {
          if (result) {
            setData(result)
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

    // fetch data immediately
    fetchData()

    // set up interval to refresh data after the defined lifetime
    if (auto_update && lifetime > 0) {
      const interval = setInterval(fetchData, lifetime * 60 * 1000)

      // cleanup interval on component unmount
      return () => clearInterval(interval)
    }
  }, [route, lifetime])

  return { data, status }
}
