import { useState, type MouseEvent } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Eraser, RefreshCw, RotateCcw, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/format"
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/DataState"
import { Modal } from "@/shared/components/Modal"
import { PageHeader } from "@/shared/components/PageHeader"
import { useDlqActions } from "../hooks/useDlqActions"
import { useDlqSequences } from "../hooks/useDlq"

const PAGE_SIZE = 20

export function DlqProcessorPage() {
  const params = useParams<{
    application: string
    instanceId: string
    processor: string
  }>()
  const application = params.application ?? ""
  const instanceId = params.instanceId ?? ""
  const processor = params.processor ?? ""

  const [page, setPage] = useState(0)
  const { data, isPending, error, refetch, isFetching } = useDlqSequences(
    application,
    instanceId,
    processor,
    page,
    PAGE_SIZE,
  )
  const actions = useDlqActions(application, instanceId, processor)
  const [clearOpen, setClearOpen] = useState(false)

  const stop = (event: MouseEvent) => event.preventDefault()
  const totalPages = data
    ? Math.max(1, Math.ceil(data.totalSequences / PAGE_SIZE))
    : 1

  return (
    <section className="space-y-4">
      <PageHeader
        title="Dead Letters"
        description={`${application} / ${instanceId} — ${processor}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" render={<Link to="/dlq" />}>
              <ArrowLeft className="size-4" aria-hidden />
              Files
            </Button>
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
            <Button
              variant="destructive"
              size="sm"
              disabled={actions.clear.isPending || (data?.totalSize ?? 0) === 0}
              onClick={() => setClearOpen(true)}
            >
              <Eraser className="size-4" aria-hidden />
              Vider
            </Button>
          </div>
        }
      />

      {isPending ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : data.sequences.length === 0 ? (
        <EmptyState title="Aucune séquence en échec" />
      ) : (
        <>
          <div className="space-y-2">
            {data.sequences.map((sequence) => (
              <details
                key={sequence.sequenceId}
                className="rounded-lg border border-border bg-background"
              >
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="truncate font-mono text-xs">
                      {sequence.sequenceId}
                    </span>
                    <Badge variant="destructive">
                      {sequence.size} message(s)
                    </Badge>
                    {sequence.truncated ? (
                      <Badge variant="outline">aperçu tronqué</Badge>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actions.retry.isPending}
                      onClick={(event) => {
                        stop(event)
                        actions.retry.mutate(sequence.sequenceId)
                      }}
                    >
                      <RotateCcw className="size-4" aria-hidden />
                      Retry
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={actions.remove.isPending}
                      onClick={(event) => {
                        stop(event)
                        actions.remove.mutate(sequence.sequenceId)
                      }}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      Supprimer
                    </Button>
                  </div>
                </summary>
                <div className="overflow-x-auto border-t border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                      <tr>
                        <th className="px-4 py-2 font-medium">#</th>
                        <th className="px-4 py-2 font-medium">Message</th>
                        <th className="px-4 py-2 font-medium">Cause</th>
                        <th className="px-4 py-2 font-medium">Enqueue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {sequence.entries.map((entry, index) => (
                        <tr key={entry.id}>
                          <td className="px-4 py-2 text-xs">
                            {entry.index ?? index}
                          </td>
                          <td className="px-4 py-2">
                            <div className="font-mono text-xs">{entry.id}</div>
                            <div className="text-xs text-muted-foreground">
                              {entry.payloadType ?? "—"}
                            </div>
                          </td>
                          <td className="max-w-md px-4 py-2 text-xs text-muted-foreground">
                            <div>{entry.causeType ?? "—"}</div>
                            <div className="line-clamp-2">
                              {entry.causeMessage ?? ""}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-xs whitespace-nowrap">
                            {formatDateTime(entry.enqueuedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {page + 1} / {totalPages} — {data.totalSequences} séquence(s),{" "}
              {data.totalSize} message(s)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        </>
      )}

      <Modal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Vider la dead-letter queue ?"
        description="Toutes les séquences de ce processor seront supprimées définitivement. L'action est auditée."
        footer={
          <>
            <Button variant="outline" onClick={() => setClearOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={actions.clear.isPending}
              onClick={() =>
                actions.clear.mutate(undefined, {
                  onSuccess: () => setClearOpen(false),
                })
              }
            >
              Vider la DLQ
            </Button>
          </>
        }
      />
    </section>
  )
}
