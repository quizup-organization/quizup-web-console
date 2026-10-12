import { Navigate, Outlet, useLocation } from "react-router-dom"
import { ShieldOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FullScreenLoader } from "@/shared/components/FullScreenLoader"
import { redirectToLogout } from "../lib/oidc"
import {
  useIsAdmin,
  useSessionProfile,
  useSessionStatus,
} from "../stores/useSessionStore"

/**
 * Garde des routes d'exploitation : session valide **et** `ROLE_ADMIN` (claim `roles` du JWT
 * `quizup-identity`). L'API `quizup-console` re-vérifie le rôle côté serveur.
 */
export function AdminGate() {
  const status = useSessionStatus()
  const isAdmin = useIsAdmin()
  const profile = useSessionProfile()
  const location = useLocation()

  if (status === "loading") {
    return <FullScreenLoader label="Vérification de la session…" />
  }
  if (status === "anonymous") {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }
  if (!isAdmin) {
    return (
      <div className="grid min-h-dvh place-items-center p-6">
        <Card className="w-[min(92vw,26rem)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldOff className="size-5 text-destructive" aria-hidden />
              Accès refusé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              La console d'exploitation est réservée aux administrateurs
              (<code>ROLE_ADMIN</code>). Le compte connecté
              {profile?.email ? ` (${profile.email})` : ""} ne dispose pas de ce rôle.
            </p>
            <Button variant="outline" onClick={() => void redirectToLogout()}>
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  return <Outlet />
}
