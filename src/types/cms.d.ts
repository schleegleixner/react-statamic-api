export type ResultType = {
  success: boolean
  message: string
  endpoint?: string
  results?: StepResultType[]
  error?: string
}

export type StepResultType = {
  name: string
  success: boolean
  error?: string
  payload?: any
}

export type RebuildResult = {
  name: string
  success: boolean
  mode?: RebuildMode
  release?: string | null
  result?: any
}

export type RebuildMode = 'full' | 'incremental'

// Expensive transfers since `base`; everything else is always refetched
export type FlushChanges = {
  tiles: string[]
  sources: string[]
  images: string[]
}

// Release info sent by the CMS: `changes` only apply on top of `base`,
// `release` is the id the cache represents after the rebuild
export type FlushRelease = {
  base?: string
  release?: string
  changes?: FlushChanges
}
