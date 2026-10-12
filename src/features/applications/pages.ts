import { lazy } from "react"

export const ApplicationsPage = lazy(() =>
  import("./pages/ApplicationsPage").then((module) => ({
    default: module.ApplicationsPage,
  })),
)
export const ApplicationDetailPage = lazy(() =>
  import("./pages/ApplicationDetailPage").then((module) => ({
    default: module.ApplicationDetailPage,
  })),
)
