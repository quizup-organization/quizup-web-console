import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import type { MetricsRange } from "@/shared/components/RangeSelector"
import { messagesService } from "../lib/messages"

export function useMessageMetrics(application: string, range: MetricsRange) {
  return useQuery({
    queryKey: queryKeys.metrics.messages(application, range),
    queryFn: () => messagesService.metrics(application, range),
    placeholderData: keepPreviousData,
    enabled: Boolean(application),
  })
}
