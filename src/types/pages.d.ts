export type PageMappingType = {
  id: string
  site_id: string
  title: string
  slug: string
  url: string
  full_url: string
  parent: {
    id: string
    title: string
    url: string
    full_url: string
  } | null
  content?: PageContentType
}

export type PageContentType = {
  name: string
  headline: string | null
  page_type: string
} & {
  [key: string]: any
}
