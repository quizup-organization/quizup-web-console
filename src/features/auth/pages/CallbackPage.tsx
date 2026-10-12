import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { FullScreenLoader } from "@/shared/components/FullScreenLoader"
import { userManager } from "../lib/oidc"
import { useSessionStore } from "../stores/useSessionStore"

export function CallbackPage() {
  const navigate = useNavigate()
  const setUser = useSessionStore((state) => state.setUser)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    userManager
      .signinRedirectCallback()
      .then((user) => {
        if (active) {
          setUser(user)
          navigate("/", { replace: true })
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setUser(null)
          setError(cause instanceof Error ? cause.message : "Échec de la connexion")
        }
      })
    return () => {
      active = false
    }
  }, [navigate, setUser])

  if (error) {
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-sm text-destructive">
        Échec de la connexion : {error}
      </div>
    )
  }
  return <FullScreenLoader label="Connexion…" />
}
