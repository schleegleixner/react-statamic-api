'use client'

import { usePathname } from 'next/navigation'
import { findPageByIdOrSlug, getTileTitle } from '../utils/content'
import { BreadcrumbType } from '../types'

function findTileById(
  tilemap: { tile_id: string; title: string | null }[] | null = null,
  tile_id: string,
) {
  return tilemap ? tilemap.find(entry => entry.tile_id === tile_id) : null
}

function getCompleteLink(breadcrumbs: BreadcrumbType[], slug: string): string {
  // generate current linkchain and add the new slug
  let link = '/'
  if (breadcrumbs.length > 0) {
    const paths = breadcrumbs
      .map(bc => (bc.link ? bc.link.replace(/^\//, '') : ''))
      .filter(Boolean)
    paths.push(slug)
    link += paths.join('/')
  } else {
    link += slug
  }
  return link
}

// custom hook to get the breadcrumbs based on the current URL
export default function useBreadcrumbs(
  site_id: string,
  sitemap: any[],
  tilemap: { tile_id: string; title: string | null }[] | null = null,
  title404: string = '404 - Seite nicht gefunden',
): BreadcrumbType[] {
  const pathname: string = usePathname() ?? '/'
  const url = pathname === '/' ? '' : pathname.replace(/^\//, '')
  let breadcrumbs: BreadcrumbType[] = []

  let segments = url.split('/').filter(Boolean)

  if (segments[0] === site_id) {
    segments = segments.slice(1)
  }

  let valid = true // track if the path chain is valid

  if (!segments.length) {
    const start_page = findPageByIdOrSlug(sitemap, 'home')
    breadcrumbs = [
      {
        title: start_page ? start_page.title : '',
        link: '/',
      },
    ]
  } else {
    segments.forEach(segment => {
      if (!valid) {
        return
      }

      const page = findPageByIdOrSlug(sitemap, segment)

      if (!page) {
        // check if segment is a tile_id and get the title from tilemap
        const tile = findTileById(tilemap, segment)
        if (tile) {
          const title = getTileTitle(findTileById(tilemap, segment))
          // use title and the title of the previous breadcrumb
          breadcrumbs.push({
            title:
              title +
              (breadcrumbs.length > 0
                ? ' | ' + (breadcrumbs[breadcrumbs.length - 1].title ?? '')
                : ''),
            link: getCompleteLink(breadcrumbs, segment),
          })
        } else {
          valid = false
        }
      } else {
        breadcrumbs.push({
          title: page.title,
          link: getCompleteLink(breadcrumbs, page.slug),
        })
      }
    })
  }

  if (!breadcrumbs.length) {
    breadcrumbs = [
      {
        title: title404,
        link: '/',
      },
    ]
  }

  return breadcrumbs
}
