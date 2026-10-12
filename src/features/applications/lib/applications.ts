import { api } from "@/lib/api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { PrometheusResult } from "@/lib/metrics"

export interface InstanceView {
  application: string
  instanceId: string
  version: string | null
  address: string | null
  uptimeSeconds: number
  firstSeen: string
  lastSeen: string
}

export interface ApplicationMetricsView {
  heapUsed: PrometheusResult
  processCpu: PrometheusResult
  systemCpu: PrometheusResult
  threads: PrometheusResult
  httpRate: PrometheusResult
}

export interface ApplicationDetailView {
  application: string
  instances: InstanceView[]
  handlers: {
    commands: string[]
    queries: string[]
  }
  processors: Array<{
    application: string
    instanceId: string
    name: string
    mode: string
    running: boolean
    error: boolean
    replaying: boolean
    canPause: boolean
    canPlay: boolean
    canSplit: boolean
    canMerge: boolean
    tokenStoreIdentifier: string | null
    activeThreads: number
    capacity: number
    warnings: string[]
    updatedAt: string
    segments: Array<{
      segmentId: number
      mask: number
      caughtUp: boolean
      replaying: boolean
      merging: boolean
      errorState: boolean
      currentPosition: number | null
      resetPosition: number | null
      onePartOf: number
      errorType: string | null
      errorMessage: string | null
    }>
  }>
}

export const applicationsService = {
  list: (): Promise<InstanceView[]> =>
    api.get<InstanceView[]>(ENDPOINTS.console.applications),
  detail: (application: string): Promise<ApplicationDetailView> =>
    api.get<ApplicationDetailView>(ENDPOINTS.console.application(application)),
  metrics: (application: string, range: string): Promise<ApplicationMetricsView> =>
    api.get<ApplicationMetricsView>(ENDPOINTS.console.metrics.application(application), {
      params: { range },
    }),
}
