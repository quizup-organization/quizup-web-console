import { useState } from "react"
import { Search as SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDateTime } from "@/lib/format"
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/DataState"
import { JsonViewer } from "@/shared/components/JsonViewer"
import { PageHeader } from "@/shared/components/PageHeader"
import { useApplications } from "@/features/applications"
import { useAggregateEvents, useEventsByType, useSnapshots } from "../hooks/useSearch"

type Mode = "aggregate" | "type"

/**
 * Recherche (contenu natif Axon Server) : événements par agrégat (avec payload) ou par type,
 * plus les snapshots de l'agrégat.
 */
export function SearchPage() {
  const { data: applications } = useApplications()
  const [application, setApplication] = useState("")
  const [mode, setMode] = useState<Mode>("aggregate")
  const [aggregateInput, setAggregateInput] = useState("")
  const [aggregateId, setAggregateId] = useState("")
  const [type, setType] = useState("")

  const events = useAggregateEvents(application, mode === "aggregate" ? aggregateId : "")
  const snapshots = useSnapshots(application, mode === "aggregate" ? aggregateId : "")
  const byType = useEventsByType(application, mode === "type" ? type : "")

  return (
    <section className="space-y-4">
      <PageHeader
        title="Recherche"
        description="Event store JPA par service : agrégats, événements (payload) et snapshots."
      />

      <div className="flex flex-wrap items-center gap-3">
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

        <div className="inline-flex rounded-md border border-border p-0.5">
          {(["aggregate", "type"] as Mode[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`rounded px-3 py-1 text-xs transition-colors ${
                mode === value
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {value === "aggregate" ? "Par agrégat" : "Par type d'événement"}
            </button>
          ))}
        </div>

        {mode === "aggregate" ? (
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              setAggregateId(aggregateInput.trim())
            }}
          >
            <Input
              value={aggregateInput}
              onChange={(event) => setAggregateInput(event.target.value)}
              placeholder="Identifiant d'agrégat (ex. UUID)"
              className="w-72"
            />
            <Button type="submit" size="sm" disabled={!application || !aggregateInput.trim()}>
              <SearchIcon className="size-4" aria-hidden />
              Rechercher
            </Button>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              value={type}
              onChange={(event) => setType(event.target.value)}
              placeholder="Type d'événement (ex. UserRegisteredEvent)"
              className="w-72"
            />
          </div>
        )}
      </div>

      {!application ? (
        <p className="text-sm text-muted-foreground">
          Sélectionne une application pour interroger son event store.
        </p>
      ) : mode === "aggregate" ? (
        !aggregateId ? (
          <p className="text-sm text-muted-foreground">
            Saisis un identifiant d'agrégat puis lance la recherche.
          </p>
        ) : events.isPending ? (
          <LoadingState />
        ) : events.error ? (
          <ErrorState error={events.error} onRetry={() => void events.refetch()} />
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-border bg-background">
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <h2 className="text-sm font-medium">
                  Événements de {aggregateId} (depuis le dernier snapshot)
                </h2>
                <Badge variant="outline">{events.data?.length ?? 0} événement(s)</Badge>
              </div>
              {events.data && events.data.length > 0 ? (
                <div className="divide-y divide-border">
                  {events.data.map((event) => (
                    <div key={event.id} className="space-y-2 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="secondary">#{event.sequenceNumber}</Badge>
                        <span className="font-mono">{event.payloadType}</span>
                        <span className="text-muted-foreground">
                          {formatDateTime(event.timestamp)}
                        </span>
                        <span className="font-mono text-muted-foreground">{event.id}</span>
                      </div>
                      <JsonViewer value={event.payload} maxHeight={220} />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Aucun événement"
                  description="Agrégat inconnu, ou tous ses événements précédents sont couverts par un snapshot."
                />
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-background">
              <div className="border-b border-border px-4 py-2">
                <h2 className="text-sm font-medium">Snapshots</h2>
              </div>
              {snapshots.data && snapshots.data.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                    <tr>
                      <th className="px-4 py-2 font-medium">Séquence</th>
                      <th className="px-4 py-2 font-medium">Type d'agrégat</th>
                      <th className="px-4 py-2 font-medium">Payload</th>
                      <th className="px-4 py-2 font-medium">Horodatage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {snapshots.data.map((snapshot) => (
                      <tr key={snapshot.id}>
                        <td className="px-4 py-2">{snapshot.sequenceNumber}</td>
                        <td className="px-4 py-2 font-mono text-xs">
                          {snapshot.aggregateType}
                        </td>
                        <td className="px-4 py-2 font-mono text-xs">
                          {snapshot.payloadType ?? "—"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {formatDateTime(snapshot.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-4 py-4 text-sm text-muted-foreground">Aucun snapshot.</p>
              )}
            </div>
          </div>
        )
      ) : byType.isPending ? (
        <LoadingState />
      ) : byType.error ? (
        <ErrorState error={byType.error} onRetry={() => void byType.refetch()} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <h2 className="text-sm font-medium">
              Événements {type ? `de type ${type}` : "du store"}
            </h2>
            <Badge variant="outline">{byType.data?.length ?? 0} résultat(s)</Badge>
          </div>
          {byType.data && byType.data.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2 font-medium">Index</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Agrégat</th>
                  <th className="px-4 py-2 font-medium">Séq.</th>
                  <th className="px-4 py-2 font-medium">Horodatage</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {byType.data.map((event) => (
                  <tr key={event.id}>
                    <td className="px-4 py-2 text-xs">{event.globalIndex}</td>
                    <td className="px-4 py-2 font-mono text-xs">{event.payloadType}</td>
                    <td className="px-4 py-2 font-mono text-xs">{event.aggregateId}</td>
                    <td className="px-4 py-2">{event.sequenceNumber}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatDateTime(event.timestamp)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMode("aggregate")
                          setAggregateInput(event.aggregateId)
                          setAggregateId(event.aggregateId)
                        }}
                      >
                        Voir l'agrégat
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState title="Aucun événement" description="Affine le type recherché." />
          )}
        </div>
      )}
    </section>
  )
}
