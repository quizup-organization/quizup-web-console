import { useEffect } from "react"

import { userManager } from "../lib/oidc"

/** Cible du renouvellement silencieux OIDC (`automaticSilentRenew`). */
export function SilentCallbackPage() {
  useEffect(() => {
    void userManager.signinSilentCallback()
  }, [])
  return null
}
