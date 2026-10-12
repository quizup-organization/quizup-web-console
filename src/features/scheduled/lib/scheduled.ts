import { api } from "@/lib/api"
import { ENDPOINTS } from "@/lib/endpoints"

export interface ScheduledEventView {
  taskName: string
  taskInstance: string
  executionTime: string
  picked: boolean
  lastSuccess: string | null
  lastFailure: string | null
  consecutiveFailures: number | null
}

export const scheduledEventsService = {
  list: (application: string, limit = 100): Promise<ScheduledEventView[]> =>
    api.get<ScheduledEventView[]>(ENDPOINTS.console.search.scheduledEvents, {
      params: { application, limit },
    }),
  cancel: (application: string, taskName: string, taskInstance: string): Promise<void> =>
    api.delete<void>(
      ENDPOINTS.console.actions.cancelScheduledEvent(application, taskName, taskInstance),
    ),
}
