import { lazy } from "react"

export const UserReportsPage = lazy(() =>
  import("./pages/UserReportsPage").then((module) => ({
    default: module.UserReportsPage,
  })),
)

export const UserModerationDetailPage = lazy(() =>
  import("./pages/UserModerationDetailPage").then((module) => ({
    default: module.UserModerationDetailPage,
  })),
)
