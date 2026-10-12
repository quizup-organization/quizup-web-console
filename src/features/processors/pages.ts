import { lazy } from "react"

export const ProcessorsPage = lazy(() =>
  import("./pages/ProcessorsPage").then((module) => ({
    default: module.ProcessorsPage,
  })),
)
export const ProcessorDetailPage = lazy(() =>
  import("./pages/ProcessorDetailPage").then((module) => ({
    default: module.ProcessorDetailPage,
  })),
)
