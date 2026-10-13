import { toast } from "sonner"

import { createApiClient } from "@/lib/api-client"
import { config } from "@/lib/config"
import { sessionGateway } from "@/lib/session"

/**
 * Client de la surface admin du BFF (`/api/admin/media`, `ROLE_ADMIN`) — second client HTTP de
 * la console (le premier cible `quizup-console`). Même session OIDC, même purge sur 401 ;
 * toasts d'erreur globaux sauf 401/404/408 (gérés localement par les écrans).
 */
export const bffApi = createApiClient({
  baseUrl: config.bffUrl,
  defaultTimeoutMs: 30_000,
  getAuthToken: () => sessionGateway.getAccessToken(),
  onUnauthorized: () => sessionGateway.onUnauthorized(),
  onError: (error) => {
    if (error.statusCode === 401) {
      return
    }
    if (error.statusCode !== 404 && error.statusCode !== 408) {
      toast.error(error.message)
    }
  },
})
