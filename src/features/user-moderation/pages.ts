import { lazy } from "react"

export const PlayersPage = lazy(() =>
  import("./pages/PlayersPage").then((module) => ({
    default: module.PlayersPage,
  })),
)

export const UserModerationDetailPage = lazy(() =>
  import("./pages/UserModerationDetailPage").then((module) => ({
    default: module.UserModerationDetailPage,
  })),
)
