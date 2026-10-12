import { api } from "@/lib/api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { PrometheusResult } from "@/lib/metrics"

export interface MessageMetricsView {
  commands: PrometheusResult
  queries: PrometheusResult
  events: PrometheusResult
}

export interface InFlightCommandView {
  name: string
  count: number
  oldestStart: string | null
  lastStart: string | null
  instances: string[]
}

export const messagesService = {
  metrics: (application: string, range: string): Promise<MessageMetricsView> =>
    api.get<MessageMetricsView>(ENDPOINTS.console.metrics.messages(application), {
      params: { range },
    }),
  inFlight: (application?: string): Promise<InFlightCommandView[]> =>
    api.get<InFlightCommandView[]>(ENDPOINTS.console.commandsInFlight, {
      params: { application },
    }),
}
