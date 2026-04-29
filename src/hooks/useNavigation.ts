'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { getNavigation } from '../lib'
import { NavigationItemType, NavigationType } from '../types'

type NavigationItemWithoutActive = Omit<NavigationItemType, 'active' | 'children'> & {
  active?: boolean
  children?: NavigationItemWithoutActive[]
}

type NavigationWithoutActive = Omit<NavigationType, 'items'> & {
  items: NavigationItemWithoutActive[]
}

function normalizePath(path: string | null | undefined): string {
  if (!path || path === '/') {
    return '/'
  }

  const [path_without_query] = path.split(/[?#]/)
  return `/${path_without_query.replace(/^\/+|\/+$/g, '')}`
}

function markActiveItems(
  items: NavigationItemWithoutActive[] = [],
  current_path: string,
): NavigationItemType[] {
  return items.map(item => {
    const children = markActiveItems(item.children ?? [], current_path)
    const item_path = normalizePath(item.full_url)
    const is_active =
      item_path === '/'
        ? current_path === '/'
        : current_path === item_path || current_path.startsWith(`${item_path}/`)

    return {
      ...item,
      active: is_active || children.some(child => child.active),
      children,
    }
  })
}

export default function useNavigation<T = NavigationType>(
  handle: string = 'main',
  site_id: string = 'default',
) {
  const pathname = usePathname()
  const [navigation, setNavigation] = useState<NavigationWithoutActive | null>(
    null,
  )
  const [is_loading, setIsLoading] = useState<boolean>(false)
  const [has_error, setHasError] = useState<boolean>(false)

  useEffect(() => {
    let is_active = true

    setIsLoading(true)
    setHasError(false)

    const fetchData = async () => {
      try {
        const data = await getNavigation(handle, site_id)

        if (is_active) {
          setNavigation(data as NavigationWithoutActive | null)
        }
      } catch (err) {
        console.error(err)

        if (is_active) {
          setNavigation(null)
          setHasError(true)
        }
      } finally {
        if (is_active) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      is_active = false
    }
  }, [handle, site_id])

  const active_navigation = useMemo(() => {
    if (!navigation) {
      return null
    }

    return {
      ...navigation,
      items: markActiveItems(navigation.items, normalizePath(pathname)),
    } as T
  }, [navigation, pathname])

  return { navigation: active_navigation, is_loading, has_error }
}
