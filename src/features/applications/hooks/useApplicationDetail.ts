import { useQuery } from "@tanstack/react-query"

import { CONSOLE_POLL_MS } from "@/lib/query-client"
import { queryKeys } from "@/lib/query-keys"
import { applicationsService } from "../lib/applications"

export function useApplicationDetail(application: string) {
  return useQuery({
    queryKey: queryKeys.applications.detail(application),
    queryFn: () => applicationsService.detail(application),
    refetchInterval: CONSOLE_POLL_MS,
    enabled: Boolean(application),
  })
}
