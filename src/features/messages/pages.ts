import { lazy } from "react"

export const CommandsPage = lazy(() =>
  import("./pages/MessagesPage").then((module) => ({ default: module.CommandsPage })),
)
export const QueriesPage = lazy(() =>
  import("./pages/MessagesPage").then((module) => ({ default: module.QueriesPage })),
)
