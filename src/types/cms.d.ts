export type ResultType = {
  success: boolean
  message: string
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
}

export type SiteType = {
  handle: string
  name: string
  locale: string
  url: string
}
