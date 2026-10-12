import { api } from "@/lib/api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { PrometheusResult } from "@/lib/metrics"

export interface ProcessorView {
  application: string
  instanceId: string
  name: string
  mode: string
  running: boolean
  error: boolean
  replaying: boolean
  supportsReset: boolean
  canPause: boolean
  canPlay: boolean
  canSplit: boolean
  canMerge: boolean
  tokenStoreIdentifier: string | null
  activeThreads: number
  capacity: number
  warnings: string[]
  updatedAt: string
}

export interface SegmentView {
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
}

export interface ProcessorDetailView {
  processor: ProcessorView
  segments: SegmentView[]
}

export interface ProcessorMetricsView {
  processed: PrometheusResult
  durationP90: PrometheusResult
  dlqSize: PrometheusResult
  caughtUp: PrometheusResult
  replaying: PrometheusResult
}

export interface ProcessorLagView {
  processor: string
  tailPosition: number | null
  maxLag: number | null
  segments: Array<{
    segmentId: number
    currentPosition: number | null
    lag: number | null
  }>
}

export interface ResetPayload {
  position: "TAIL" | "HEAD" | "INSTANT"
  instant?: string
}

export const processorsService = {
  list: (application?: string): Promise<ProcessorView[]> =>
    api.get<ProcessorView[]>(ENDPOINTS.console.processors, {
      params: { application },
    }),
  detail: (
    application: string,
    instanceId: string,
    name: string,
  ): Promise<ProcessorDetailView> =>
    api.get<ProcessorDetailView>(
      ENDPOINTS.console.processor(application, instanceId, name),
    ),
  metrics: (
    application: string,
    instanceId: string,
    name: string,
    range: string,
  ): Promise<ProcessorMetricsView> =>
    api.get<ProcessorMetricsView>(
      ENDPOINTS.console.metrics.processor(application, instanceId, name),
      { params: { range } },
    ),
  lag: (
    application: string,
    instanceId: string,
    name: string,
  ): Promise<ProcessorLagView> =>
    api.get<ProcessorLagView>(
      ENDPOINTS.console.processorLag(application, instanceId, name),
    ),
}

export const processorActionsService = {
  pause: (application: string, instanceId: string, name: string) =>
    api.post<void>(ENDPOINTS.console.actions.pauseProcessor(application, instanceId, name)),
  start: (application: string, instanceId: string, name: string) =>
    api.post<void>(ENDPOINTS.console.actions.startProcessor(application, instanceId, name)),
  reset: (
    application: string,
    instanceId: string,
    name: string,
    payload: ResetPayload,
  ) =>
    api.post<unknown>(
      ENDPOINTS.console.actions.resetProcessor(application, instanceId, name),
      payload,
    ),
  split: (
    application: string,
    instanceId: string,
    name: string,
    segmentId: number,
  ) =>
    api.post<unknown>(
      ENDPOINTS.console.actions.splitSegment(application, instanceId, name, segmentId),
    ),
  merge: (
    application: string,
    instanceId: string,
    name: string,
    segmentId: number,
  ) =>
    api.post<unknown>(
      ENDPOINTS.console.actions.mergeSegment(application, instanceId, name, segmentId),
    ),
}
