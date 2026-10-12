import { Link } from "react-router-dom"
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
import { useDlqStats } from "../hooks/useDlq"

export function DlqPage() {
  const { data, isPending, error, refetch, isFetching } = useDlqStats()

  return (
    <section className="space-y-4">
      <PageHeader
        title="Dead Letters"
        description="Messages en échec (par processing group) : consulte une file pour relancer ou supprimer une séquence."
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
          title="Aucune dead-letter queue"
          description="Aucun message en échec — ou DLQ désactivée côté SDK."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Application / instance</th>
                <th className="px-4 py-2 font-medium">Processor</th>
                <th className="px-4 py-2 font-medium">Messages</th>
                <th className="px-4 py-2 font-medium">Séquences</th>
                <th className="px-4 py-2 font-medium">MAJ</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((stat) => (
                <tr key={`${stat.application}/${stat.instanceId}/${stat.processor}`}>
                  <td className="px-4 py-2">
                    <div className="font-medium">{stat.application}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {stat.instanceId}
                    </div>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{stat.processor}</td>
                  <td className="px-4 py-2">
                    <Badge variant={stat.size > 0 ? "destructive" : "secondary"}>
                      {stat.size}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">{stat.sequences}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatDateTime(stat.updatedAt)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      render={
                        <Link
                          to={`/dlq/${encodeURIComponent(stat.application)}/${encodeURIComponent(stat.instanceId)}/${encodeURIComponent(stat.processor)}`}
                        />
                      }
                    >
                      Ouvrir
                    </Button>
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
