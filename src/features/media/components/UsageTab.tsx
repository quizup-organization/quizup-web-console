import { useState } from "react"

import { Button } from "@/components/ui/button"
import { formatBytes } from "@/lib/format"
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/DataState"
import { useMediaUsage } from "../hooks/useMedia"

/** Onglet Usage : volumétrie du quota média par joueur. */
export function UsageTab() {
  const [page, setPage] = useState(0)
  const result = useMediaUsage(page)

  if (result.isPending) {
    return <LoadingState />
  }
  if (result.error || !result.data) {
    return <ErrorState error={result.error} onRetry={() => void result.refetch()} />
  }

  const usage = result.data

  return (
    <div className="space-y-3">
      {usage.content.length === 0 ? (
        <EmptyState title="Aucun média uploadé" description="Le catalogue est vide." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Joueur</th>
                <th className="px-4 py-2 font-medium">Images</th>
                <th className="px-4 py-2 font-medium">Octets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usage.content.map((row) => (
                <tr key={row.uploadedBy}>
                  <td className="px-4 py-2 font-mono text-xs">{row.uploadedBy}</td>
                  <td className="px-4 py-2">{row.assetCount.toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{formatBytes(row.bytes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {usage.totalElements} joueur(s) · page {usage.page + 1}/{Math.max(usage.totalPages, 1)}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={usage.first}
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={usage.last}
            onClick={() => setPage((current) => current + 1)}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}
