'use client'

import { useEffect, useState } from 'react'
import { getTileset } from '../lib'

export default function useTileset(site_id: string = 'default') {
  const [collection, setCollection] = useState<any | null>(null)
  const [is_loading, setIsLoading] = useState<boolean>(false)
  const [has_error, setHasError] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)

    const fetchData = async () => {
      try {
        const tileset = await getTileset(site_id)
        setCollection(tileset)
      } catch (err) {
        console.error(err)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [site_id])

  return { collection, is_loading, has_error }
}
