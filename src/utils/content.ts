import { PageMappingType } from '../types'
import { getContent } from '../lib'
import { replaceContentTags } from './sanitize'

export function findPageByIdOrSlug(
  sitemap: PageMappingType[],
  identifier: string,
): PageMappingType | null {
  if (!sitemap || !identifier) {
    return null
  }

  // test if identifier is a full URL (starts with /)
  for (const entry of sitemap) {
    if (entry.full_url === identifier) {
      return entry
    }
  }

  const found = sitemap.find(
    entry =>
      entry.id === identifier ||
      entry.slug === identifier ||
      entry.url === identifier ||
      entry.full_url === identifier ||
      entry.full_url === identifier + '/', // with trailing slash
  )
  return found ?? null
}

export async function getCurrentPageServer(
  sitemap: PageMappingType[],
  pathname: string,
  enforce_matching_url = false,
): Promise<PageMappingType | undefined> {
  let page_data: PageMappingType | undefined | null

  // mage sure pathname starts with a slash
  if (typeof pathname !== 'string' || !pathname.startsWith('/')) {
    return page_data ?? undefined
  }

  const segments = pathname.split('/').filter(Boolean)
  const path = '/' + segments.join('/')
  const path_parent = '/' + segments.slice(0, -1).join('/')

  if (segments.length) {
    // fetch the current page based on the last or second last segment
    page_data =
      findPageByIdOrSlug(sitemap, path) ??
      findPageByIdOrSlug(sitemap, path_parent)
  } else {
    // is start page
    page_data = findPageByIdOrSlug(sitemap, 'home')
  }

  // if enforce_matching_url is true, the pathname must match the page's full_url (no mounted slugs)
  if (
    enforce_matching_url &&
    page_data &&
    path !== '/' &&
    path !== page_data.full_url.replace(/\/$/, '')
  ) {
    return undefined
  }

  return page_data ?? undefined
}

export async function getPageTitleServer(
  pathname: string,
  site_id: string,
  page: PageMappingType | undefined,
  seo_title: string | null,
  divider = ' | ',
  default_page_title = '404 - Seite nicht gefunden',
) {
  const segments = pathname.split('/').filter(Boolean)
  const last_segment = segments.length ? segments[segments.length - 1] : null

  // check for specific page slugs and return tile name if available
  if (page && page.slug !== last_segment && last_segment !== site_id) {
    // check if the last segment is a tile id
    if (last_segment) {
      const tile_content = await getContent('tile', last_segment, site_id)
      if (tile_content) {
        const tile_title = getTileTitle(tile_content)
        return getPageTitle(tile_title + divider + page?.title, seo_title)
      }
    }
  }

  return getPageTitle(
    page?.content?.seo_title ?? page?.title ?? default_page_title,
    seo_title,
  )
}

export async function getPageTitle(
  title: string,
  seo_title?: string | null,
): Promise<string> {
  return `${title} | ${seo_title ?? ''}`
}

export async function setPageTitle(
  title: string,
  seo_title?: string | null,
): Promise<boolean> {
  if (typeof document !== 'undefined') {
    document.title = await getPageTitle(title, seo_title)
    return true
  }

  return false
}

export function getTileTitle(tile: any): string {
  if (!tile || typeof tile.title !== 'string') {
    return ''
  }
  return replaceContentTags(tile.title)
}
