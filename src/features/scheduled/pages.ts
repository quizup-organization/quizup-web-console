import { lazy } from "react"

export const ScheduledEventsPage = lazy(() =>
  import("./pages/ScheduledEventsPage").then((module) => ({
    default: module.ScheduledEventsPage,
  })),
)
