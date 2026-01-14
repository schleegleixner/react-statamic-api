'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

const DEFAULT_SEARCH_PARAM = 'suche'
const MIN_SEARCH_LENGTH = 3
const MAX_SEARCH_LENGTH = 128

interface UseSearchOptions {
  paramKey?: string
  minLength?: number
  maxLength?: number
}

interface UseSearchReturn {
  searchTerm: string
  setSearchTerm: (value: string) => void
  clearSearch: () => void
  isValidSearch: boolean
}

const updateQueryString = (key: string, value: string | null) => {
  const url = new URL(window.location.href)
  if (value) {
    url.searchParams.set(key, value)
  } else {
    url.searchParams.delete(key)
  }
  window.history.pushState({}, '', url.toString())
}

export default function useSearch(
  options: UseSearchOptions = {},
): UseSearchReturn {
  const {
    paramKey = DEFAULT_SEARCH_PARAM,
    minLength = MIN_SEARCH_LENGTH,
    maxLength = MAX_SEARCH_LENGTH,
  } = options

  const [searchTerm, setSearchTermState] = useState('')
  const [initialized, setInitialized] = useState(false)

  const searchParams = useSearchParams()
  const searchQuery = searchParams?.get(paramKey) || null

  const isValidSearch =
    searchTerm.length >= minLength && searchTerm.length <= maxLength

  // Initialisierung aus URL
  useEffect(() => {
    if (searchQuery) {
      setSearchTermState(searchQuery)
    }
    setInitialized(true)
  }, [searchQuery])

  // URL-Synchronisation
  useEffect(() => {
    if (!initialized) {
      return
    }

    if (isValidSearch) {
      updateQueryString(paramKey, searchTerm)
    } else {
      updateQueryString(paramKey, null)
    }
  }, [searchTerm, initialized, isValidSearch, paramKey])

  const setSearchTerm = useCallback((value: string) => {
    setSearchTermState(value)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchTermState('')
    updateQueryString(paramKey, null)
  }, [paramKey])

  return {
    searchTerm,
    setSearchTerm,
    clearSearch,
    isValidSearch,
  }
}

export const updateSearchQueryString = (
  value: string | null,
  key: string = DEFAULT_SEARCH_PARAM,
) => {
  updateQueryString(key, value)
}

export const clearSearchQueryString = (key: string = DEFAULT_SEARCH_PARAM) => {
  updateQueryString(key, null)
}

export const getSearchQuery = (
  searchParams: URLSearchParams | null,
  key: string = DEFAULT_SEARCH_PARAM,
): string | null => {
  return searchParams?.get(key) || null
}
