import { useQuery } from "@tanstack/react-query"

import { CONSOLE_POLL_MS } from "@/lib/query-client"
import { queryKeys } from "@/lib/query-keys"
import { applicationsService } from "../lib/applications"

export function useApplications() {
  return useQuery({
    queryKey: queryKeys.applications.all,
    queryFn: () => applicationsService.list(),
    refetchInterval: CONSOLE_POLL_MS,
  })
}
