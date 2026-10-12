import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Merge,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Scissors,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { formatDateTime, formatPosition } from "@/lib/format"
import { ErrorState, LoadingState } from "@/shared/components/DataState"
import { Modal } from "@/shared/components/Modal"
import { RangeSelector, type MetricsRange } from "@/shared/components/RangeSelector"
import { TimeSeriesChart } from "@/shared/components/TimeSeriesChart"
import { useProcessorActions } from "../hooks/useProcessorActions"
import { useProcessorLag } from "../hooks/useProcessorLag"
import { useProcessorMetrics } from "../hooks/useProcessorMetrics"
import { useProcessorDetail } from "../hooks/useProcessors"

type ResetPosition = "TAIL" | "HEAD" | "INSTANT"

function segmentLag(
  segments: Array<{ segmentId: number; lag: number | null }> | undefined,
  segmentId: number,
): string {
  const segment = segments?.find((entry) => entry.segmentId === segmentId)
  if (!segment || segment.lag === null || segment.lag === undefined) {
    return "—"
  }
  return segment.lag.toLocaleString("fr-FR")
}

export function ProcessorDetailPage() {
  const params = useParams<{
    application: string
    instanceId: string
    name: string
  }>()
  const application = params.application ?? ""
  const instanceId = params.instanceId ?? ""
  const name = params.name ?? ""

  const { data, isPending, error, refetch, isFetching } = useProcessorDetail(
    application,
    instanceId,
    name,
  )
  const actions = useProcessorActions(application, instanceId, name)
  const [range, setRange] = useState<MetricsRange>("1h")
  const metrics = useProcessorMetrics(application, instanceId, name, range)
  const lag = useProcessorLag(application, instanceId, name)
  const [resetOpen, setResetOpen] = useState(false)
  const [position, setPosition] = useState<ResetPosition>("TAIL")
  const [instant, setInstant] = useState("")

  if (isPending) {
    return <LoadingState />
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  const { processor, segments } = data
  const busy =
    actions.pause.isPending ||
    actions.start.isPending ||
    actions.reset.isPending ||
    actions.split.isPending ||
    actions.merge.isPending

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button variant="link" size="sm" className="px-0" render={<Link to="/processors" />}>
            <ArrowLeft className="size-4" aria-hidden />
            Processors
          </Button>
          <h1 className="font-heading font-mono text-xl font-semibold">{processor.name}</h1>
          <p className="text-sm text-muted-foreground">
            {processor.application} / <span className="font-mono">{processor.instanceId}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} aria-hidden />
            Rafraîchir
          </Button>
          {processor.running ? (
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => actions.pause.mutate()}
            >
              <Pause className="size-4" aria-hidden />
              Pause
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => actions.start.mutate()}
            >
              <Play className="size-4" aria-hidden />
              Start
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            title="Pause sur toutes les instances hébergeant ce processor"
            onClick={() => actions.pauseAll.mutate()}
          >
            <Pause className="size-4" aria-hidden />
            Pause toutes
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            title="Start sur toutes les instances hébergeant ce processor"
            onClick={() => actions.startAll.mutate()}
          >
            <Play className="size-4" aria-hidden />
            Start toutes
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={busy || processor.running || !processor.supportsReset}
            title={
              processor.running
                ? "Le processor doit être en pause avant un reset"
                : undefined
            }
            onClick={() => setResetOpen(true)}
          >
            <RotateCcw className="size-4" aria-hidden />
            Reset (replay)
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">État</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Mode</p>
            <p>{processor.mode}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Statut</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {processor.error ? <Badge variant="destructive">erreur</Badge> : null}
              {processor.replaying ? <Badge variant="outline">replay</Badge> : null}
              {processor.running ? (
                <Badge variant="secondary">démarré</Badge>
              ) : (
                <Badge variant="outline">arrêté</Badge>
              )}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Reset supporté</p>
            <p>{processor.supportsReset ? "oui" : "non"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Dernière remontée</p>
            <p>{formatDateTime(processor.updatedAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Token store</p>
            <p className="truncate font-mono text-xs" title={processor.tokenStoreIdentifier ?? undefined}>
              {processor.tokenStoreIdentifier ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Segments / capacité / threads</p>
            <p>
              {segments.length} / {processor.capacity || "—"} / {processor.activeThreads}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Lag (messages de retard)</p>
            <p>
              {lag.data?.maxLag !== null && lag.data?.maxLag !== undefined ? (
                <Badge variant={lag.data.maxLag > 0 ? "destructive" : "secondary"}>
                  {lag.data.maxLag.toLocaleString("fr-FR")}
                </Badge>
              ) : (
                "—"
              )}
              {lag.data?.tailPosition !== null && lag.data?.tailPosition !== undefined ? (
                <span className="ml-2 text-xs text-muted-foreground">
                  tail {lag.data.tailPosition.toLocaleString("fr-FR")}
                </span>
              ) : null}
            </p>
          </div>
          {processor.warnings.length > 0 ? (
            <div className="sm:col-span-2 lg:col-span-4">
              <p className="text-muted-foreground">Warnings</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {processor.warnings.map((warning) => (
                  <Badge key={warning} variant="destructive">
                    {warning}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Métriques</h2>
          <RangeSelector value={range} onChange={setRange} />
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <TimeSeriesChart
            title="Événements traités (par résultat)"
            result={metrics.data?.processed}
            unit="/s"
          />
          <TimeSeriesChart
            title="Durée de traitement p90"
            result={metrics.data?.durationP90}
            labelKey="__none"
            unit="s"
          />
          <TimeSeriesChart
            title="Dead-letter queue (messages)"
            result={metrics.data?.dlqSize}
            labelKey="__none"
          />
          <TimeSeriesChart
            title="À jour / replay (1 = oui)"
            result={metrics.data?.caughtUp}
            labelKey="__none"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-2 font-medium">Segment</th>
              <th className="px-4 py-2 font-medium">Position</th>
              <th className="px-4 py-2 font-medium">Lag</th>
              <th className="px-4 py-2 font-medium">État</th>
              <th className="px-4 py-2 font-medium">Détail</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {segments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  Aucun segment remonté.
                </td>
              </tr>
            ) : (
              segments.map((segment) => (
                <tr key={segment.segmentId}>
                  <td className="px-4 py-2 font-mono text-xs">
                    {segment.segmentId} (mask {segment.mask}, {segment.onePartOf} segment(s))
                  </td>
                  <td className="px-4 py-2 text-xs">
                    <div>courante : {formatPosition(segment.currentPosition)}</div>
                    {segment.resetPosition !== null ? (
                      <div className="text-muted-foreground">
                        reset : {formatPosition(segment.resetPosition)}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {segmentLag(lag.data?.segments, segment.segmentId)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {segment.errorState ? (
                        <Badge variant="destructive">erreur</Badge>
                      ) : null}
                      {segment.replaying ? <Badge variant="outline">replay</Badge> : null}
                      {segment.merging ? <Badge variant="outline">merge</Badge> : null}
                      {segment.caughtUp ? (
                        <Badge variant="secondary">à jour</Badge>
                      ) : (
                        <Badge variant="default">en retard</Badge>
                      )}
                    </div>
                  </td>
                  <td className="max-w-md px-4 py-2 text-xs text-muted-foreground">
                    {segment.errorState ? (
                      <>
                        <div>{segment.errorType}</div>
                        <div className="line-clamp-2">{segment.errorMessage}</div>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        title="Split du segment"
                        onClick={() => actions.split.mutate(segment.segmentId)}
                      >
                        <Scissors className="size-4" aria-hidden />
                        Split
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        title="Merge du segment"
                        onClick={() => actions.merge.mutate(segment.segmentId)}
                      >
                        <Merge className="size-4" aria-hidden />
                        Merge
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset du processor (replay)"
        description="Le processor doit être arrêté (pause faite). Le reset invoque les @ResetHandler puis repart de la position choisie."
        footer={
          <>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={
                actions.reset.isPending || (position === "INSTANT" && !instant)
              }
              onClick={() =>
                actions.reset.mutate(
                  {
                    position,
                    instant:
                      position === "INSTANT"
                        ? new Date(instant).toISOString()
                        : undefined,
                  },
                  { onSuccess: () => setResetOpen(false) },
                )
              }
            >
              Lancer le replay
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="reset-position">Position de départ</Label>
            <select
              id="reset-position"
              value={position}
              onChange={(event) =>
                setPosition(event.target.value as ResetPosition)
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="TAIL">Début du flux (tail)</option>
              <option value="HEAD">Fin du flux (head)</option>
              <option value="INSTANT">Instant précis</option>
            </select>
          </div>
          {position === "INSTANT" ? (
            <div className="space-y-1">
              <Label htmlFor="reset-instant">Instant</Label>
              <input
                id="reset-instant"
                type="datetime-local"
                value={instant}
                onChange={(event) => setInstant(event.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          ) : null}
        </div>
      </Modal>
    </section>
  )
}
