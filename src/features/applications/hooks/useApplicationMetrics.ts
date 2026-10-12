import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import type { MetricsRange } from "@/shared/components/RangeSelector"
import { applicationsService } from "../lib/applications"

export function useApplicationMetrics(application: string, range: MetricsRange) {
  return useQuery({
    queryKey: queryKeys.metrics.application(application, range),
    queryFn: () => applicationsService.metrics(application, range),
    placeholderData: keepPreviousData,
    enabled: Boolean(application),
  })
}
