import { lazy } from "react"

export const DlqPage = lazy(() =>
  import("./pages/DlqPage").then((module) => ({ default: module.DlqPage })),
)
export const DlqProcessorPage = lazy(() =>
  import("./pages/DlqProcessorPage").then((module) => ({
    default: module.DlqProcessorPage,
  })),
)
