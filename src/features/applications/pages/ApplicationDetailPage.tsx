import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime, formatUptime, isStale } from "@/lib/format"
import { ErrorState, LoadingState } from "@/shared/components/DataState"
import { PageHeader } from "@/shared/components/PageHeader"
import { RangeSelector, type MetricsRange } from "@/shared/components/RangeSelector"
import { TimeSeriesChart } from "@/shared/components/TimeSeriesChart"
import { useApplicationDetail } from "../hooks/useApplicationDetail"
import { useApplicationMetrics } from "../hooks/useApplicationMetrics"

export function ApplicationDetailPage() {
  const params = useParams<{ application: string }>()
  const application = params.application ?? ""
  const { data, isPending, error, refetch, isFetching } = useApplicationDetail(application)
  const [range, setRange] = useState<MetricsRange>("1h")
  const metrics = useApplicationMetrics(application, range)

  if (isPending) {
    return <LoadingState rows={5} />
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  return (
    <section className="space-y-4">
      <PageHeader
        title={data.application}
        description={`${data.instances.length} instance(s) · ${data.handlers.commands.length} handler(s) de commandes · ${data.handlers.queries.length} handler(s) de queries · ${data.processors.length} processor(s)`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" render={<Link to="/applications" />}>
              <ArrowLeft className="size-4" aria-hidden />
              Applications
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
          </div>
        }
      />

      <div className="overflow-x-auto rounded-lg border border-border bg-background">
        <div className="border-b border-border px-4 py-2">
          <h2 className="text-sm font-medium">Instances</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-2 font-medium">Instance</th>
              <th className="px-4 py-2 font-medium">Version</th>
              <th className="px-4 py-2 font-medium">Adresse</th>
              <th className="px-4 py-2 font-medium">Uptime</th>
              <th className="px-4 py-2 font-medium">Dernière remontée</th>
              <th className="px-4 py-2 font-medium">État</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.instances.map((instance) => (
              <tr key={instance.instanceId}>
                <td className="px-4 py-2 font-mono text-xs">{instance.instanceId}</td>
                <td className="px-4 py-2">{instance.version ?? "—"}</td>
                <td className="px-4 py-2 font-mono text-xs">{instance.address ?? "—"}</td>
                <td className="px-4 py-2">{formatUptime(instance.uptimeSeconds)}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {formatDateTime(instance.lastSeen)}
                </td>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <HandlersCard title={`Handlers de commandes (${data.handlers.commands.length})`} empty="Aucun handler de commande remonté" handlers={data.handlers.commands} />
        <HandlersCard title={`Handlers de queries (${data.handlers.queries.length})`} empty="Aucun handler de query remonté" handlers={data.handlers.queries} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-background">
        <div className="border-b border-border px-4 py-2">
          <h2 className="text-sm font-medium">Event processors</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-2 font-medium">Instance</th>
              <th className="px-4 py-2 font-medium">Processor</th>
              <th className="px-4 py-2 font-medium">Segments</th>
              <th className="px-4 py-2 font-medium">État</th>
              <th className="px-4 py-2 font-medium">Warnings</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.processors.map((processor) => (
              <tr key={`${processor.instanceId}/${processor.name}`}>
                <td className="px-4 py-2 font-mono text-xs">{processor.instanceId}</td>
                <td className="px-4 py-2 font-mono text-xs">{processor.name}</td>
                <td className="px-4 py-2">
                  {processor.segments.length} / {processor.capacity || "—"}
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    {processor.error ? <Badge variant="destructive">erreur</Badge> : null}
                    {processor.replaying ? <Badge variant="outline">replay</Badge> : null}
                    {processor.running ? (
                      <Badge variant="secondary">démarré</Badge>
                    ) : (
                      <Badge variant="outline">arrêté</Badge>
                    )}
                  </div>
                </td>
                <td className="max-w-xs px-4 py-2 text-xs text-muted-foreground">
                  {processor.warnings.length > 0 ? processor.warnings.join(" · ") : "—"}
                </td>
                <td className="px-4 py-2 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <Link
                        to={`/processors/${encodeURIComponent(processor.application)}/${encodeURIComponent(processor.instanceId)}/${encodeURIComponent(processor.name)}`}
                      />
                    }
                  >
                    Détail
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Métriques JVM</h2>
          <RangeSelector value={range} onChange={setRange} />
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <TimeSeriesChart
            title="Mémoire heap (par instance)"
            result={metrics.data?.heapUsed}
            labelKey="instance"
            unit="octets"
          />
          <TimeSeriesChart
            title="CPU processus (par instance)"
            result={metrics.data?.processCpu}
            labelKey="instance"
            unit="ratio"
          />
          <TimeSeriesChart
            title="Threads (par instance)"
            result={metrics.data?.threads}
            labelKey="instance"
          />
          <TimeSeriesChart
            title="Requêtes HTTP/s"
            result={metrics.data?.httpRate}
            unit="/s"
          />
        </div>
      </div>
    </section>
  )
}

function HandlersCard({
  title,
  empty,
  handlers,
}: {
  title: string
  empty: string
  handlers: string[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {handlers.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ul className="max-h-64 space-y-1 overflow-auto font-mono text-xs">
            {handlers.map((handler) => (
              <li key={handler} className="truncate">
                {handler}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
