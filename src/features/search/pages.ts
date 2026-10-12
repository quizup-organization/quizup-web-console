import { lazy } from "react"

export const SearchPage = lazy(() =>
  import("./pages/SearchPage").then((module) => ({ default: module.SearchPage })),
)
