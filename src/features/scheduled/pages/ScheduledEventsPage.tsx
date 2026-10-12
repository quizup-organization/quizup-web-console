import { useState } from "react"
import { RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/format"
import { ApplicationSelect } from "@/shared/components/ApplicationSelect"
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/DataState"
import { FilterBar, FilterField } from "@/shared/components/FilterBar"
import { Modal } from "@/shared/components/Modal"
import { PageHeader } from "@/shared/components/PageHeader"
import { useApplications } from "@/features/applications"
import { useCancelScheduledEvent } from "../hooks/useScheduledActions"
import { useScheduledEvents } from "../hooks/useScheduledEvents"
import type { ScheduledEventView } from "../lib/scheduled"

/**
 * Scheduled events (deadlines persistantes db-scheduler) — contenu natif Axon Server.
 */
export function ScheduledEventsPage() {
  const { data: instances } = useApplications()
  const applications = [
    ...new Set((instances ?? []).map((instance) => instance.application)),
  ].sort()
  const [application, setApplication] = useState("")
  const { data, isPending, error, refetch, isFetching } = useScheduledEvents(application)
  const cancel = useCancelScheduledEvent(application)
  const [pendingCancel, setPendingCancel] = useState<ScheduledEventView | null>(null)

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

      <FilterBar>
        <FilterField label="Application">
          <ApplicationSelect
            applications={applications}
            value={application}
            onChange={setApplication}
          />
        </FilterField>
      </FilterBar>

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
                <th className="px-4 py-2" />
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
                  <td className="px-4 py-2 text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={cancel.isPending}
                      onClick={() => setPendingCancel(task)}
                    >
                      Annuler
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={pendingCancel !== null}
        onClose={() => setPendingCancel(null)}
        title="Annuler la tâche planifiée ?"
        description={
          pendingCancel
            ? `${pendingCancel.taskName} / ${pendingCancel.taskInstance} — la deadline sera supprimée (action auditée).`
            : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setPendingCancel(null)}>
              Fermer
            </Button>
            <Button
              variant="destructive"
              disabled={cancel.isPending}
              onClick={() => {
                if (pendingCancel) {
                  cancel.mutate(
                    {
                      taskName: pendingCancel.taskName,
                      taskInstance: pendingCancel.taskInstance,
                    },
                    { onSuccess: () => setPendingCancel(null) },
                  )
                }
              }}
            >
              Annuler la tâche
            </Button>
          </>
        }
      />
    </section>
  )
}
