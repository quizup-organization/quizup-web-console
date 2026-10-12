import { useState } from "react"
import { RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/format"
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/DataState"
import { PageHeader } from "@/shared/components/PageHeader"
import { useAudit } from "../hooks/useAudit"

const PAGE_SIZE = 20

export function AuditPage() {
  const [page, setPage] = useState(0)
  const { data, isPending, error, refetch, isFetching } = useAudit(page, PAGE_SIZE)

  const totalPages = data ? Math.max(1, Math.ceil(data.totalElements / PAGE_SIZE)) : 1

  return (
    <section className="space-y-4">
      <PageHeader
        title="Audit"
        description="Journal des actions d'exploitation (qui, quoi, quelle cible, résultat)."
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
      ) : data.items.length === 0 ? (
        <EmptyState title="Aucune action auditée" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-background">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2 font-medium">Horodatage</th>
                  <th className="px-4 py-2 font-medium">Acteur</th>
                  <th className="px-4 py-2 font-medium">Action</th>
                  <th className="px-4 py-2 font-medium">Cible</th>
                  <th className="px-4 py-2 font-medium">Paramètres</th>
                  <th className="px-4 py-2 font-medium">Résultat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((entry, index) => (
                  <tr key={`${entry.occurredAt}-${index}`}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatDateTime(entry.occurredAt)}
                    </td>
                    <td className="px-4 py-2">{entry.actor ?? "—"}</td>
                    <td className="px-4 py-2 font-mono text-xs">{entry.action}</td>
                    <td className="px-4 py-2">
                      <span className="font-mono text-xs">
                        {entry.application ?? "—"}
                        {entry.instanceId ? `/${entry.instanceId}` : ""}
                      </span>
                      {entry.target ? (
                        <div className="text-xs text-muted-foreground">
                          {entry.target}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {entry.parameters ?? "—"}
                    </td>
                    <td className="px-4 py-2">
                      {entry.result === "SUCCESS" ? (
                        <Badge variant="secondary">succès</Badge>
                      ) : (
                        <Badge variant="destructive" title={entry.error ?? undefined}>
                          échec
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {page + 1} / {totalPages} — {data.totalElements} action(s)
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
    </section>
  )
}
