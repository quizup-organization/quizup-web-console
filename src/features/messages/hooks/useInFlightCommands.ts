import { useQuery } from "@tanstack/react-query"

import { CONSOLE_POLL_MS } from "@/lib/query-client"
import { queryKeys } from "@/lib/query-keys"
import { messagesService } from "../lib/messages"

/** Commandes en vol (lecture seule) — diagnostique les blocages sous charge. */
export function useInFlightCommands(application: string) {
  return useQuery({
    queryKey: queryKeys.commands.inFlight(application || undefined),
    queryFn: () => messagesService.inFlight(application || undefined),
    refetchInterval: CONSOLE_POLL_MS,
    enabled: Boolean(application),
  })
}
