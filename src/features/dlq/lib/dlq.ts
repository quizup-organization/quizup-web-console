import { api } from "@/lib/api"
import { ENDPOINTS } from "@/lib/endpoints"

export interface DlqStatView {
  application: string
  instanceId: string
  processor: string
  size: number
  sequences: number
  updatedAt: string
}

export interface DlqEntryView {
  id: string
  index: number | null
  payloadType: string | null
  causeType: string | null
  causeMessage: string | null
  enqueuedAt: string
  lastTouched: string
}

export interface DlqSequenceView {
  sequenceId: string
  size: number
  truncated: boolean
  entries: DlqEntryView[]
}

export interface DlqSequencesPage {
  page: number
  size: number
  totalSequences: number
  totalSize: number
  sequences: DlqSequenceView[]
}

export const dlqService = {
  stats: (): Promise<DlqStatView[]> => api.get<DlqStatView[]>(ENDPOINTS.console.dlq),
  sequences: (
    application: string,
    instanceId: string,
    processor: string,
    page: number,
    size = 20,
  ): Promise<DlqSequencesPage> =>
    api.get<DlqSequencesPage>(
      ENDPOINTS.console.dlqSequences(application, instanceId, processor),
      { params: { page, size } },
    ),
}

export const dlqActionsService = {
  retrySequence: (
    application: string,
    instanceId: string,
    processor: string,
    sequenceId: string,
  ) =>
    api.post<{ processed: boolean }>(
      ENDPOINTS.console.actions.retryDlqSequence(application, instanceId, processor, sequenceId),
    ),
  deleteSequence: (
    application: string,
    instanceId: string,
    processor: string,
    sequenceId: string,
  ) =>
    api.delete<{ deleted: number }>(
      ENDPOINTS.console.actions.deleteDlqSequence(application, instanceId, processor, sequenceId),
    ),
  clear: (application: string, instanceId: string, processor: string) =>
    api.post<{ cleared: boolean }>(
      ENDPOINTS.console.actions.clearDlq(application, instanceId, processor),
    ),
}
