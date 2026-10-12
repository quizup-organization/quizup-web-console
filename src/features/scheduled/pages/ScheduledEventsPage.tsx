import { useState } from "react"
import { RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/format"
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/DataState"
import { PageHeader } from "@/shared/components/PageHeader"
import { useApplications } from "@/features/applications"
import { useScheduledEvents } from "../hooks/useScheduledEvents"

/**
 * Scheduled events (deadlines persistantes db-scheduler) — contenu natif Axon Server.
 */
export function ScheduledEventsPage() {
  const { data: applications } = useApplications()
  const [application, setApplication] = useState("")
  const { data, isPending, error, refetch, isFetching } = useScheduledEvents(application)

  return (
    <section className="space-y-4">
      <PageHeader
        title="Scheduled events"
        description="Deadlines persistantes (db-scheduler) par application."
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={isFetching || !application}
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

      <select
        value={application}
        onChange={(event) => setApplication(event.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="">Choisir une application…</option>
        {(applications ?? [])
          .map((instance) => instance.application)
          .filter((value, index, array) => array.indexOf(value) === index)
          .sort()
          .map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
      </select>

      {!application ? (
        <p className="text-sm text-muted-foreground">
          Sélectionne une application pour afficher ses tâches planifiées.
        </p>
      ) : isPending ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState title="Aucune tâche planifiée" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Tâche</th>
                <th className="px-4 py-2 font-medium">Instance</th>
                <th className="px-4 py-2 font-medium">Exécution</th>
                <th className="px-4 py-2 font-medium">État</th>
                <th className="px-4 py-2 font-medium">Dernier succès</th>
                <th className="px-4 py-2 font-medium">Échecs consécutifs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((task) => (
                <tr key={`${task.taskName}/${task.taskInstance}`}>
                  <td className="px-4 py-2 font-mono text-xs">{task.taskName}</td>
                  <td className="px-4 py-2 font-mono text-xs">{task.taskInstance}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatDateTime(task.executionTime)}
                  </td>
                  <td className="px-4 py-2">
                    {task.picked ? (
                      <Badge variant="outline">en cours</Badge>
                    ) : (
                      <Badge variant="secondary">en attente</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatDateTime(task.lastSuccess)}
                  </td>
                  <td className="px-4 py-2">
                    {task.consecutiveFailures ? (
                      <Badge variant="destructive">{task.consecutiveFailures}</Badge>
                    ) : (
                      "—"
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
