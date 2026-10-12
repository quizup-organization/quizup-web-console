import { toast } from "sonner"

import { createApiClient } from "@/lib/api-client"
import { config } from "@/lib/config"
import { sessionGateway } from "@/lib/session"

/**
 * Instance unique du client API : base URL de `quizup-console`, Bearer de la session,
 * purge de session sur 401, toasts d'erreur globaux (sauf 401/404/408 gérés localement).
 */
export const api = createApiClient({
  baseUrl: config.apiUrl,
  defaultTimeoutMs: 15_000,
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
