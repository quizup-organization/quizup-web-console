import { useState } from "react"
import { RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatNumber, type PrometheusResult } from "@/lib/metrics"
import { ApplicationSelect } from "@/shared/components/ApplicationSelect"
import { ErrorState, LoadingState } from "@/shared/components/DataState"
import { FilterBar, FilterField } from "@/shared/components/FilterBar"
import { PageHeader } from "@/shared/components/PageHeader"
import { RangeSelector, type MetricsRange } from "@/shared/components/RangeSelector"
import { TimeSeriesChart } from "@/shared/components/TimeSeriesChart"
import { useApplications } from "@/features/applications"
import { useMessageMetrics } from "../hooks/useMessageMetrics"

function MessageMetricsPage({
  kind,
  title,
  description,
  pick,
}: {
  kind: "commands" | "queries"
  title: string
  description: string
  pick: (metrics: ReturnType<typeof useMessageMetrics>["data"]) => PrometheusResult | undefined
}) {
  const { data: instances } = useApplications()
  const applications = [
    ...new Set((instances ?? []).map((instance) => instance.application)),
  ].sort()
  const [application, setApplication] = useState("")
  const [range, setRange] = useState<MetricsRange>("1h")
  const { data, isPending, error, refetch, isFetching } = useMessageMetrics(
    application,
    range,
  )
  const result = pick(data)

  return (
    <section className="space-y-4">
      <PageHeader
        title={title}
        description={description}
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

      <FilterBar>
        <FilterField label="Application">
          <ApplicationSelect
            applications={applications}
            value={application}
            onChange={setApplication}
          />
        </FilterField>
        <FilterField label="Période">
          <RangeSelector value={range} onChange={setRange} />
        </FilterField>
      </FilterBar>

      {!application ? (
        <p className="text-sm text-muted-foreground">
          Sélectionne une application pour afficher ses {kind === "commands" ? "commandes" : "queries"}.
        </p>
      ) : isPending ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <TimeSeriesChart
            title={`${title} — débit par message`}
            result={result}
            labelKey="name"
            unit="/s"
            height={220}
          />
          <div className="overflow-x-auto rounded-lg border border-border bg-background">
            <div className="border-b border-border px-4 py-2">
              <h2 className="text-sm font-medium">Derniers débits par message</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2 font-medium">Message</th>
                  <th className="px-4 py-2 font-medium">Résultat</th>
                  <th className="px-4 py-2 font-medium">Débit /s</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result?.series.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                      Aucune donnée
                    </td>
                  </tr>
                ) : (
                  (result?.series ?? []).map((series, index) => (
                    <tr key={`${series.metric.name}-${series.metric.result}-${index}`}>
                      <td className="px-4 py-2 font-mono text-xs">
                        {series.metric.name ?? "—"}
                      </td>
                      <td className="px-4 py-2">
                        {series.metric.result === "failure" ? (
                          <Badge variant="destructive">échec</Badge>
                        ) : (
                          <Badge variant="secondary">
                            {series.metric.result ?? "success"}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {formatNumber(series.samples.at(-1)?.value)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}

export function CommandsPage() {
  return (
    <MessageMetricsPage
      kind="commands"
      title="Commandes"
      description="Débits et échecs par type de commande (Prometheus, 5 min)."
      pick={(metrics) => metrics?.commands}
    />
  )
}

export function QueriesPage() {
  return (
    <MessageMetricsPage
      kind="queries"
      title="Queries"
      description="Débits et échecs par type de query (Prometheus, 5 min)."
      pick={(metrics) => metrics?.queries}
    />
  )
}
