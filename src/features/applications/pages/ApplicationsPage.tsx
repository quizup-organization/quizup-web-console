import { RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateTime, formatUptime, isStale } from "@/lib/format"
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/DataState"
import { PageHeader } from "@/shared/components/PageHeader"
import { useApplications } from "../hooks/useApplications"

export function ApplicationsPage() {
  const { data, isPending, error, refetch, isFetching } = useApplications()

  return (
    <section className="space-y-4">
      <PageHeader
        title="Applications"
        description="Réplicas connectés et dernière remontée d'agent (push toutes les 15 s)."
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            <RefreshCw
              className={isFetching ? "size-4 animate-spin" : "size-4"}
              aria-hidden
            />
            Rafraîchir
          </Button>
        }
      />

      {isPending ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          title="Aucune application connectée"
          description="Démarre un service avec l'agent console activé (quizup.axon.console.enabled=true)."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Application</th>
                <th className="px-4 py-2 font-medium">Instance</th>
                <th className="px-4 py-2 font-medium">Version</th>
                <th className="px-4 py-2 font-medium">Adresse</th>
                <th className="px-4 py-2 font-medium">Uptime</th>
                <th className="px-4 py-2 font-medium">Dernière remontée</th>
                <th className="px-4 py-2 font-medium">État</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((instance) => (
                <tr key={`${instance.application}/${instance.instanceId}`}>
                  <td className="px-4 py-2 font-medium">{instance.application}</td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {instance.instanceId}
                  </td>
                  <td className="px-4 py-2">{instance.version ?? "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {instance.address ?? "—"}
                  </td>
                  <td className="px-4 py-2">
                    {formatUptime(instance.uptimeSeconds)}
                  </td>
                  <td className="px-4 py-2">{formatDateTime(instance.lastSeen)}</td>
                  <td className="px-4 py-2">
                    {isStale(instance.lastSeen) ? (
                      <Badge variant="destructive">hors ligne</Badge>
                    ) : (
                      <Badge variant="secondary">en ligne</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
