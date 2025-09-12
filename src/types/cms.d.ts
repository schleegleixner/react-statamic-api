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
