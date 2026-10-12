import { create } from "zustand"
import type { User } from "oidc-client-ts"

import { decodeAccessToken, type SessionProfile } from "@/lib/jwt"

export type SessionStatus = "loading" | "anonymous" | "authenticated"

interface SessionState {
  status: SessionStatus
  user: User | null
  profile: SessionProfile | null
  setUser: (user: User | null) => void
  reset: () => void
}

/** Source de vérité de la session (Zustand) — alimentée par `SessionBootstrap` et `oidc.ts`. */
export const useSessionStore = create<SessionState>()((set) => ({
  status: "loading",
  user: null,
  profile: null,
  setUser: (user) =>
    set(
      user
        ? {
            status: "authenticated",
            user,
            profile: decodeAccessToken(user.access_token),
          }
        : { status: "anonymous", user: null, profile: null },
    ),
  reset: () => set({ status: "loading", user: null, profile: null }),
}))

export const useSessionStatus = () => useSessionStore((state) => state.status)

export const useSessionProfile = () => useSessionStore((state) => state.profile)

export const useIsAdmin = () =>
  useSessionStore((state) => state.profile?.roles.includes("ROLE_ADMIN") ?? false)
