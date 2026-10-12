import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import { auditService } from "../lib/audit"

export function useAudit(page: number, size = 20) {
  return useQuery({
    queryKey: queryKeys.audit.list(page, size),
    queryFn: () => auditService.list(page, size),
    placeholderData: keepPreviousData,
  })
}
