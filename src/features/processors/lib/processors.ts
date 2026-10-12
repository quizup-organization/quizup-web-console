import { api } from "@/lib/api"
import { ENDPOINTS } from "@/lib/endpoints"

export interface ProcessorView {
  application: string
  instanceId: string
  name: string
  mode: string
  running: boolean
  error: boolean
  replaying: boolean
  supportsReset: boolean
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
  errorType: string | null
  errorMessage: string | null
}

export interface ProcessorDetailView {
  processor: ProcessorView
  segments: SegmentView[]
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
