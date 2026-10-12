import { api } from "@/lib/api"
import { ENDPOINTS } from "@/lib/endpoints"

export interface AggregateEventView {
  id: string
  aggregateId: string
  aggregateType: string
  sequenceNumber: number
  payloadType: string | null
  payload: unknown
  metaData: Record<string, unknown>
  timestamp: string
}

export interface SnapshotView {
  id: string
  aggregateId: string
  sequenceNumber: number
  aggregateType: string
  payloadType: string | null
  payloadRevision: string | null
  timestamp: string | null
}

export interface EventSearchView {
  id: string
  aggregateId: string
  aggregateType: string
  sequenceNumber: number
  payloadType: string | null
  payloadRevision: string | null
  globalIndex: number
  timestamp: string | null
}

export const searchService = {
  events: (
    application: string,
    aggregateId: string,
    minSequence?: number,
  ): Promise<AggregateEventView[]> =>
    api.get<AggregateEventView[]>(ENDPOINTS.console.search.events, {
      params: { application, aggregateId, minSequence },
    }),
  eventsByType: (
    application: string,
    type: string,
    limit = 50,
  ): Promise<EventSearchView[]> =>
    api.get<EventSearchView[]>(ENDPOINTS.console.search.eventsByType, {
      params: { application, type, limit },
    }),
  snapshots: (application: string, aggregateId: string): Promise<SnapshotView[]> =>
    api.get<SnapshotView[]>(ENDPOINTS.console.search.snapshots, {
      params: { application, aggregateId },
    }),
}
