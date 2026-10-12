import { QueryClient } from "@tanstack/react-query"

import type { ApiError } from "@/shared/types/api"

/** Les agents poussent toutes les 15 s : un état plus vieux que ~30 s est rafraîchi. */
export const CONSOLE_STALE_MS = 15_000

/** Polling de l'état d'exploitation (aligné sur l'intervalle de push des agents). */
export const CONSOLE_POLL_MS = 15_000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CONSOLE_STALE_MS,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const apiError = error as ApiError
        const retryable =
          apiError.statusCode === undefined ||
          apiError.statusCode === 0 ||
          apiError.statusCode === 408 ||
          apiError.statusCode >= 500
        return retryable && failureCount < 2
      },
    },
  },
})
