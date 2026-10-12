import { UserManager, WebStorageStateStore } from "oidc-client-ts"

import { config } from "@/lib/config"
import { registerSessionGateway } from "@/lib/session"
import { useSessionStore } from "../stores/useSessionStore"

/**
 * OIDC Authorization Code + PKCE via `oidc-client-ts`, adressé directement à `quizup-identity`
 * (client public `console`). Le renouvellement silencieux est automatique (`/silent-callback`).
 */
export const userManager = new UserManager({
  authority: config.oidcAuthority,
  client_id: config.oidcClientId,
  redirect_uri: config.oidcRedirectUri,
  post_logout_redirect_uri: window.location.origin,
  silent_redirect_uri: `${window.location.origin}/silent-callback`,
  response_type: "code",
  scope: config.oidcScope,
  loadUserInfo: false,
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
})

export function redirectToLogin(): Promise<void> {
  return userManager.signinRedirect()
}

export function redirectToLogout(): Promise<void> {
  return userManager.signoutRedirect()
}

registerSessionGateway({
  getAccessToken: () => useSessionStore.getState().user?.access_token ?? null,
  onUnauthorized: () => useSessionStore.getState().setUser(null),
})
