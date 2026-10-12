import { api } from "@/lib/api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { PrometheusResult } from "@/lib/metrics"

export interface MessageMetricsView {
  commands: PrometheusResult
  queries: PrometheusResult
  events: PrometheusResult
}

export const messagesService = {
  metrics: (application: string, range: string): Promise<MessageMetricsView> =>
    api.get<MessageMetricsView>(ENDPOINTS.console.metrics.messages(application), {
      params: { range },
    }),
}
