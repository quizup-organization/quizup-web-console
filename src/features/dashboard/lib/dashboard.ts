import { api } from "@/lib/api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { PrometheusResult } from "@/lib/metrics"

export interface DashboardResponse {
  product: { name: string; version: string }
  counts: {
    instances: number
    processors: number
    processorsInError: number
    processorsReplaying: number
    dlqProcessors: number
    dlqMessages: number
    dlqSequences: number
  }
  messageRates: {
    commands: PrometheusResult
    queries: PrometheusResult
    eventsProcessed: PrometheusResult
    eventsFailed: PrometheusResult
  }
  eventStore: {
    events: number
    snapshots: number
    applications: Array<{
      application: string
      events: number
      snapshots: number
      reachable: boolean
    }>
  }
}

export const dashboardService = {
  get: (): Promise<DashboardResponse> =>
    api.get<DashboardResponse>(ENDPOINTS.console.dashboard),
}
