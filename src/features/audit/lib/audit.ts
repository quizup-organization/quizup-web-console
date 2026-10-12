import { api } from "@/lib/api"
import { ENDPOINTS } from "@/lib/endpoints"

export type AuditAction =
  | "RETRY_DLQ_SEQUENCE"
  | "DELETE_DLQ_SEQUENCE"
  | "CLEAR_DLQ"
  | "PAUSE_PROCESSOR"
  | "START_PROCESSOR"
  | "RESET_PROCESSOR"
  | "SPLIT_SEGMENT"
  | "MERGE_SEGMENT"

export type AuditResult = "SUCCESS" | "FAILURE"

export interface AuditView {
  occurredAt: string
  actor: string | null
  action: AuditAction
  application: string | null
  instanceId: string | null
  target: string | null
  parameters: string | null
  result: AuditResult
  error: string | null
}

export interface AuditPageView {
  items: AuditView[]
  page: number
  size: number
  totalElements: number
}

export const auditService = {
  list: (page: number, size = 20): Promise<AuditPageView> =>
    api.get<AuditPageView>(ENDPOINTS.console.audit, {
      params: { page, size },
    }),
}
