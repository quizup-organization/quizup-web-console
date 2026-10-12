import { useQuery } from "@tanstack/react-query"

import { CONSOLE_POLL_MS } from "@/lib/query-client"
import { queryKeys } from "@/lib/query-keys"
import { dashboardService } from "../lib/dashboard"

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.all,
    queryFn: () => dashboardService.get(),
    refetchInterval: CONSOLE_POLL_MS,
  })
}
