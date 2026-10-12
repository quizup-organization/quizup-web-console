import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import { searchService } from "../lib/search"

export function useAggregateEvents(application: string, aggregateId: string) {
  return useQuery({
    queryKey: queryKeys.search.events(application, aggregateId),
    queryFn: () => searchService.events(application, aggregateId),
    enabled: Boolean(application && aggregateId),
  })
}

export function useSnapshots(application: string, aggregateId: string, withPayload: boolean) {
  return useQuery({
    queryKey: [...queryKeys.search.snapshots(application, aggregateId), withPayload],
    queryFn: () => searchService.snapshots(application, aggregateId, withPayload),
    enabled: Boolean(application && aggregateId),
  })
}

export function useEventsByType(
  application: string | undefined,
  type: string | undefined,
  within: string,
) {
  return useQuery({
    queryKey: queryKeys.search.eventsByType(application ?? "", type ?? "", within),
    queryFn: () => searchService.eventsByType(application, type, within),
  })
}

export function useEventTypes() {
  return useQuery({
    queryKey: queryKeys.search.eventTypes(),
    queryFn: () => searchService.eventTypes(),
    staleTime: 5 * 60_000,
  })
}
