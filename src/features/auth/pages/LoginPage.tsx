import { Navigate, useLocation } from "react-router-dom"
import { ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirectToLogin } from "../lib/oidc"
import { useIsAdmin, useSessionStatus } from "../stores/useSessionStore"

export function LoginPage() {
  const status = useSessionStatus()
  const isAdmin = useIsAdmin()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? "/"

  if (status === "authenticated" && isAdmin) {
    return <Navigate to={from} replace />
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-muted/30 p-6">
      <Card className="w-[min(92vw,26rem)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" aria-hidden />
            QuizUp Console
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Console d'exploitation Axon : événements, processors, dead-letter queues et
            replay. Accès réservé aux administrateurs.
          </p>
          {status === "authenticated" && !isAdmin ? (
            <p className="text-sm text-destructive">
              Ce compte n'a pas le rôle administrateur.
            </p>
          ) : null}
          <Button className="w-full" onClick={() => void redirectToLogin()}>
            Se connecter avec QuizUp
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
