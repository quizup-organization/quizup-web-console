import { lazy } from "react"

export const MediaPage = lazy(() =>
  import("./pages/MediaPage").then((module) => ({ default: module.MediaPage })),
)
