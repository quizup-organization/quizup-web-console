import { useQuery } from "@tanstack/react-query"

import { CONSOLE_POLL_MS } from "@/lib/query-client"
import { queryKeys } from "@/lib/query-keys"
import { processorsService } from "../lib/processors"

export function useProcessorLag(application: string, instanceId: string, name: string) {
  return useQuery({
    queryKey: queryKeys.processors.lag(application, instanceId, name),
    queryFn: () => processorsService.lag(application, instanceId, name),
    refetchInterval: CONSOLE_POLL_MS,
    enabled: Boolean(application && instanceId && name),
  })
}
