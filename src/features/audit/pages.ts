import { lazy } from "react"

export const AuditPage = lazy(() =>
  import("./pages/AuditPage").then((module) => ({ default: module.AuditPage })),
)
