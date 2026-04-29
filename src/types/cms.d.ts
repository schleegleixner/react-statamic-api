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
  result?: any
}
