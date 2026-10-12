import { useQuery } from "@tanstack/react-query"

import { CONSOLE_POLL_MS } from "@/lib/query-client"
import { queryKeys } from "@/lib/query-keys"
import { scheduledEventsService } from "../lib/scheduled"

export function useScheduledEvents(application: string) {
  return useQuery({
    queryKey: queryKeys.search.scheduledEvents(application),
    queryFn: () => scheduledEventsService.list(application),
    refetchInterval: CONSOLE_POLL_MS,
    enabled: Boolean(application),
  })
}
