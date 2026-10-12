import { useQuery } from "@tanstack/react-query"

import { CONSOLE_POLL_MS } from "@/lib/query-client"
import { queryKeys } from "@/lib/query-keys"
import { processorsService } from "../lib/processors"

export function useProcessors(application?: string) {
  return useQuery({
    queryKey: queryKeys.processors.list(application),
    queryFn: () => processorsService.list(application),
    refetchInterval: CONSOLE_POLL_MS,
  })
}

export function useProcessorDetail(
  application: string,
  instanceId: string,
  name: string,
) {
  return useQuery({
    queryKey: queryKeys.processors.detail(application, instanceId, name),
    queryFn: () => processorsService.detail(application, instanceId, name),
    refetchInterval: CONSOLE_POLL_MS,
    enabled: Boolean(application && instanceId && name),
  })
}
