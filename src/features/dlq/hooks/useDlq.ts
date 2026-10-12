import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { CONSOLE_POLL_MS } from "@/lib/query-client"
import { queryKeys } from "@/lib/query-keys"
import { dlqService } from "../lib/dlq"

export function useDlqStats() {
  return useQuery({
    queryKey: queryKeys.dlq.stats(),
    queryFn: () => dlqService.stats(),
    refetchInterval: CONSOLE_POLL_MS,
  })
}

export function useDlqSequences(
  application: string,
  instanceId: string,
  processor: string,
  page: number,
  size = 20,
) {
  return useQuery({
    queryKey: queryKeys.dlq.sequences(application, instanceId, processor, page),
    queryFn: () => dlqService.sequences(application, instanceId, processor, page, size),
    enabled: Boolean(application && instanceId && processor),
    placeholderData: keepPreviousData,
  })
}
