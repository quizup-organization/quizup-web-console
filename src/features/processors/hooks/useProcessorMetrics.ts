import { keepPreviousData, useQuery } from "@tanstack/react-query"

import type { MetricsRange } from "@/shared/components/RangeSelector"
import { queryKeys } from "@/lib/query-keys"
import { processorsService } from "../lib/processors"

export function useProcessorMetrics(
  application: string,
  instanceId: string,
  name: string,
  range: MetricsRange,
) {
  return useQuery({
    queryKey: queryKeys.metrics.processor(application, instanceId, name, range),
    queryFn: () => processorsService.metrics(application, instanceId, name, range),
    placeholderData: keepPreviousData,
    enabled: Boolean(application && instanceId && name),
  })
}
