import { lazy } from "react"

export const ApplicationsPage = lazy(() =>
  import("./pages/ApplicationsPage").then((module) => ({
    default: module.ApplicationsPage,
  })),
)
