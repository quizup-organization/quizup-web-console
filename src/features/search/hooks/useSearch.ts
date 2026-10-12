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

export function useSnapshots(application: string, aggregateId: string) {
  return useQuery({
    queryKey: queryKeys.search.snapshots(application, aggregateId),
    queryFn: () => searchService.snapshots(application, aggregateId),
    enabled: Boolean(application && aggregateId),
  })
}

export function useEventsByType(application: string, type: string) {
  return useQuery({
    queryKey: queryKeys.search.eventsByType(application, type),
    queryFn: () => searchService.eventsByType(application, type),
    enabled: Boolean(application),
  })
}
