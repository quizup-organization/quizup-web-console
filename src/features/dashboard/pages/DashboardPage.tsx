import { Link } from "react-router-dom"
import { RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatBytes, formatNumber, type PrometheusResult } from "@/lib/metrics"
import { ErrorState, LoadingState } from "@/shared/components/DataState"
import { PageHeader } from "@/shared/components/PageHeader"
import { StatCard } from "@/shared/components/StatCard"
import { useDashboard } from "../hooks/useDashboard"

export function DashboardPage() {
  const { data, isPending, error, refetch, isFetching } = useDashboard()

  if (isPending) {
    return <LoadingState rows={5} />
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  const commands = rateByApplication(data.messageRates.commands)
  const queries = rateByApplication(data.messageRates.queries)
  const events = rateByApplication(data.messageRates.eventsProcessed)
  const failures = rateByApplication(data.messageRates.eventsFailed)
  const applications = new Set([
    ...commands.keys(),
    ...queries.keys(),
    ...events.keys(),
    ...failures.keys(),
  ])
  const metricsEnabled =
    data.messageRates.commands.enabled || data.messageRates.eventsProcessed.enabled

  return (
    <section className="space-y-4">
      <PageHeader
        title="Dashboard"
        description={`${data.product.name} ${data.product.version} — état des applications Axon (agents, processors, event stores, débits).`}
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Instances connectées"
          value={data.counts.instances}
          hint={`${data.counts.processors} processors suivis`}
        />
        <StatCard
          label="Processors en erreur"
          value={data.counts.processorsInError}
          tone={data.counts.processorsInError > 0 ? "danger" : "success"}
          hint={`${data.counts.processorsReplaying} en replay`}
        />
        <StatCard
          label="Processors en retard"
          value={data.counts.processorsNotCaughtUp}
          tone={data.counts.processorsNotCaughtUp > 0 ? "warning" : "success"}
          hint="Segments non à jour"
        />
        <StatCard
          label="Dead letters"
          value={data.counts.dlqMessages}
          tone={data.counts.dlqMessages > 0 ? "warning" : "success"}
          hint={`${data.counts.dlqSequences} séquence(s) · ${data.counts.dlqProcessors} file(s)`}
        />
        <StatCard
          label="Événements (event stores)"
          value={formatNumber(data.eventStore.events, 0)}
          hint={`${formatNumber(data.eventStore.snapshots, 0)} snapshot(s)`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <h2 className="text-sm font-medium">Débits par application (5 min)</h2>
            {!metricsEnabled ? (
              <Badge variant="outline">Prometheus non configuré</Badge>
            ) : null}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Application</th>
                <th className="px-4 py-2 font-medium">Commandes/s</th>
                <th className="px-4 py-2 font-medium">Queries/s</th>
                <th className="px-4 py-2 font-medium">Événements/s</th>
                <th className="px-4 py-2 font-medium">Échecs/s</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {applications.size === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    Aucune donnée de débit
                  </td>
                </tr>
              ) : (
                [...applications].sort().map((application) => (
                  <tr key={application}>
                    <td className="px-4 py-2">
                      <Link
                        className="font-medium underline-offset-2 hover:underline"
                        to={`/applications/${encodeURIComponent(application)}`}
                      >
                        {application}
                      </Link>
                    </td>
                    <td className="px-4 py-2">{formatNumber(commands.get(application))}</td>
                    <td className="px-4 py-2">{formatNumber(queries.get(application))}</td>
                    <td className="px-4 py-2">{formatNumber(events.get(application))}</td>
                    <td className="px-4 py-2">
                      {failures.get(application) ? (
                        <Badge variant="destructive">
                          {formatNumber(failures.get(application))}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <div className="border-b border-border px-4 py-2">
            <h2 className="text-sm font-medium">Event stores (JPA, par service)</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Application</th>
                <th className="px-4 py-2 font-medium">Événements</th>
                <th className="px-4 py-2 font-medium">Snapshots</th>
                <th className="px-4 py-2 font-medium">Joignable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.eventStore.applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                    Aucun event store remonté
                  </td>
                </tr>
              ) : (
                data.eventStore.applications.map((store) => (
                  <tr key={store.application}>
                    <td className="px-4 py-2">
                      <Link
                        className="font-medium underline-offset-2 hover:underline"
                        to={`/applications/${encodeURIComponent(store.application)}`}
                      >
                        {store.application}
                      </Link>
                    </td>
                    <td className="px-4 py-2">{formatNumber(store.events, 0)}</td>
                    <td className="px-4 py-2">{formatNumber(store.snapshots, 0)}</td>
                    <td className="px-4 py-2">
                      {store.reachable ? (
                        <Badge variant="secondary">oui</Badge>
                      ) : (
                        <Badge variant="destructive">non</Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <h2 className="text-sm font-medium">Stockage</h2>
          {!metricsEnabled ? (
            <Badge variant="outline">Prometheus non configuré</Badge>
          ) : null}
        </div>
        <div className="grid gap-0 lg:grid-cols-2 lg:divide-x lg:divide-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Base Postgres</th>
                <th className="px-4 py-2 font-medium">Taille</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {latestByLabel(data.storage.databases, "datname").length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-center text-muted-foreground">
                    Aucune donnée
                  </td>
                </tr>
              ) : (
                latestByLabel(data.storage.databases, "datname").map((entry) => (
                  <tr key={entry.label}>
                    <td className="px-4 py-2 font-mono text-xs">{entry.label}</td>
                    <td className="px-4 py-2">{formatBytes(entry.value)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Nœud</th>
                <th className="px-4 py-2 font-medium">Disque racine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {nodeDisks(data.storage).length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-center text-muted-foreground">
                    Aucune donnée
                  </td>
                </tr>
              ) : (
                nodeDisks(data.storage).map((node) => (
                  <tr key={node.instance}>
                    <td className="px-4 py-2 font-mono text-xs">{node.instance}</td>
                    <td className="px-4 py-2">
                      {formatBytes(node.available)} libres / {formatBytes(node.total)}
                      {node.total > 0 ? (
                        <Badge variant="outline" className="ml-2">
                          {Math.round((1 - node.available / node.total) * 100)}% utilisés
                        </Badge>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function rateByApplication(result: PrometheusResult | undefined): Map<string, number> {
  const rates = new Map<string, number>()
  for (const series of result?.series ?? []) {
    const application = series.metric.application
    const last = series.samples.at(-1)
    if (application && last && Number.isFinite(last.value)) {
      rates.set(application, last.value)
    }
  }
  return rates
}

/** Dernières valeurs d'un résultat, triées par valeur décroissante, étiquetées par un label. */
function latestByLabel(
  result: PrometheusResult | undefined,
  label: string,
): Array<{ label: string; value: number }> {
  const entries: Array<{ label: string; value: number }> = []
  for (const series of result?.series ?? []) {
    const labelValue = series.metric[label]
    const last = series.samples.at(-1)
    if (labelValue && last && Number.isFinite(last.value)) {
      entries.push({ label: labelValue, value: last.value })
    }
  }
  return entries.sort((left, right) => right.value - left.value)
}

/** Espace disque racine par nœud (fusion des séries disponibles/total par `instance`). */
function nodeDisks(storage: {
  nodeDiskAvailable: PrometheusResult
  nodeDiskTotal: PrometheusResult
}): Array<{ instance: string; available: number; total: number }> {
  const available = new Map<string, number>()
  for (const series of storage.nodeDiskAvailable?.series ?? []) {
    const last = series.samples.at(-1)
    if (series.metric.instance && last) {
      available.set(series.metric.instance, last.value)
    }
  }
  const disks: Array<{ instance: string; available: number; total: number }> = []
  for (const series of storage.nodeDiskTotal?.series ?? []) {
    const last = series.samples.at(-1)
    const instance = series.metric.instance
    if (instance && last) {
      disks.push({ instance, total: last.value, available: available.get(instance) ?? 0 })
    }
  }
  return disks.sort((left, right) => left.instance.localeCompare(right.instance))
}
