export type PageMappingType = {
  id: string
  title: string
  slug: string
  full_url: string
  parent: {
    id: string
    title: string
    url: string
    full_url: string
  } | null
  menu_position: string | null
  url: string
  content?: PageContentType
  site_id: string
}

export type PageContentType = {
  name: string
  headline: string | null
  copy: string | null
  tiles?: PageContentTileType[] | null
  hero?: {
    title: string
    topline?: string | null
    image: string
  } | null
  page_type: string
  filter: {
    category: string | null
    action_dimension: string | null
    action_field: string | null
    sdg_target: string | null
  }
  seo: {
    title: string | null
    description: string | null
    keywords: string | null
  }
}
