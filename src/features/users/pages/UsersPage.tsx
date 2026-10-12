import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/DataState"
import { PageHeader } from "@/shared/components/PageHeader"
import { useUsers } from "../hooks/useUsers"

/**
 * Page « Utilisateurs » : pas de gestion locale de comptes (OIDC) — administrateur courant et
 * acteurs du journal d'audit (équivalent du contenu natif Axon Server).
 */
export function UsersPage() {
  const { data, isPending, error, refetch } = useUsers()

  if (isPending) {
    return <LoadingState rows={4} />
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  return (
    <section className="space-y-4">
      <PageHeader
        title="Utilisateurs"
        description="Authentification OIDC (quizup-identity) : rôles portés par le JWT, actions tracées dans l'audit."
        actions={
          <Button variant="outline" size="sm" render={<Link to="/audit" />}>
            Journal d'audit
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Administrateur connecté</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{data.currentUser.email}</span>
            {data.currentUser.roles.map((role) => (
              <Badge key={role} variant="secondary">
                {role}
              </Badge>
            ))}
          </div>
          <p className="font-mono text-xs text-muted-foreground">{data.currentUser.userId}</p>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-lg border border-border bg-background">
        <div className="border-b border-border px-4 py-2">
          <h2 className="text-sm font-medium">Acteurs des actions d'exploitation</h2>
        </div>
        {data.actors.length === 0 ? (
          <EmptyState title="Aucune action auditée" description="Les actions DLQ/replay apparaîtront ici." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Acteur</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.actors.map((actor) => (
                <tr key={actor.actor}>
                  <td className="px-4 py-2">{actor.actor}</td>
                  <td className="px-4 py-2">{actor.actions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
