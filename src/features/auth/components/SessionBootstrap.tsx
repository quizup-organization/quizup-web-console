import { useEffect, type ReactNode } from "react"
import type { User } from "oidc-client-ts"

import { userManager } from "../lib/oidc"
import { useSessionStore } from "../stores/useSessionStore"

/**
 * Initialise la session OIDC au démarrage (utilisateur stocké, chargement, expiration) et
 * alimente le store — monté une fois dans `App`.
 */
export function SessionBootstrap({ children }: { children: ReactNode }) {
  const setUser = useSessionStore((state) => state.setUser)

  useEffect(() => {
    let active = true
    userManager
      .getUser()
      .then((user) => {
        if (active) {
          setUser(user)
        }
      })
      .catch(() => {
        if (active) {
          setUser(null)
        }
      })

    const onUserLoaded = (user: User) => setUser(user)
    const onUserUnloaded = () => setUser(null)

    userManager.events.addUserLoaded(onUserLoaded)
    userManager.events.addUserUnloaded(onUserUnloaded)
    userManager.events.addAccessTokenExpired(onUserUnloaded)

    return () => {
      active = false
      userManager.events.removeUserLoaded(onUserLoaded)
      userManager.events.removeUserUnloaded(onUserUnloaded)
      userManager.events.removeAccessTokenExpired(onUserUnloaded)
    }
  }, [setUser])

  return <>{children}</>
}
