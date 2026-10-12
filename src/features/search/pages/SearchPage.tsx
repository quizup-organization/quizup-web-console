import { useState } from "react"
import { Search as SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDateTime } from "@/lib/format"
import { ApplicationSelect } from "@/shared/components/ApplicationSelect"
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/DataState"
import { FilterBar, FilterField } from "@/shared/components/FilterBar"
import { JsonViewer } from "@/shared/components/JsonViewer"
import { PageHeader } from "@/shared/components/PageHeader"
import { useApplications } from "@/features/applications"
import {
  useAggregateEvents,
  useEventsByType,
  useEventTypes,
  useSnapshots,
} from "../hooks/useSearch"

type Mode = "aggregate" | "type"

const WITHIN_OPTIONS = [
  { value: "1h", label: "Dernière heure" },
  { value: "6h", label: "6 dernières heures" },
  { value: "24h", label: "24 dernières heures" },
  { value: "all", label: "Tout" },
] as const

/**
 * Recherche (contenu natif Axon Server) : événements par agrégat (avec payload) ou par type
 * (multi-applications, fenêtre temporelle), plus les snapshots de l'agrégat.
 */
export function SearchPage() {
  const { data: instances } = useApplications()
  const applications = [
    ...new Set((instances ?? []).map((instance) => instance.application)),
  ].sort()

  const [application, setApplication] = useState("")
  const [mode, setMode] = useState<Mode>("aggregate")
  const [aggregateInput, setAggregateInput] = useState("")
  const [aggregateId, setAggregateId] = useState("")
  const [type, setType] = useState("")
  const [within, setWithin] = useState("24h")
  const [withPayload, setWithPayload] = useState(false)

  const { data: eventTypes } = useEventTypes()
  const events = useAggregateEvents(application, mode === "aggregate" ? aggregateId : "")
  const snapshots = useSnapshots(
    application,
    mode === "aggregate" ? aggregateId : "",
    withPayload,
  )
  const byType = useEventsByType(
    mode === "type" ? application || undefined : undefined,
    mode === "type" ? type || undefined : undefined,
    within,
  )

  const openAggregate = (sourceApplication: string, id: string) => {
    setApplication(sourceApplication)
    setAggregateInput(id)
    setAggregateId(id)
    setMode("aggregate")
  }

  return (
    <section className="space-y-4">
      <PageHeader
        title="Recherche"
        description="Event store JPA par service : agrégats, événements (payload) et snapshots."
      />

      <FilterBar>
        <FilterField label="Application">
          <ApplicationSelect
            applications={applications}
            value={application}
            onChange={setApplication}
            includeAll={mode === "type"}
          />
        </FilterField>

        <FilterField label="Mode">
          <div className="inline-flex h-9 items-center rounded-md border border-border p-0.5">
            {(["aggregate", "type"] as Mode[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`h-8 rounded px-3 text-xs transition-colors ${
                  mode === value
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {value === "aggregate" ? "Par agrégat" : "Par type"}
              </button>
            ))}
          </div>
        </FilterField>

        {mode === "type" ? (
          <>
            <FilterField label="Fenêtre">
              <Select value={within} onValueChange={(value) => setWithin(value ?? "24h")}>
                <SelectTrigger className="w-[190px]" aria-label="Fenêtre temporelle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WITHIN_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label="Type d'événement" className="min-w-[300px]">
              {eventTypes && eventTypes.length > 0 ? (
                <Select value={type} onValueChange={(value) => setType(value ?? "")}>
                  <SelectTrigger className="w-[300px]" aria-label="Type d'événement">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les types</SelectItem>
                    {eventTypes.map((eventType) => (
                      <SelectItem key={eventType} value={eventType}>
                        {eventType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  placeholder="Nom du type (ex. UserRegisteredEvent)"
                  className="w-[300px]"
                />
              )}
            </FilterField>
          </>
        ) : (
          <FilterField label="Identifiant d'agrégat" className="min-w-[340px] flex-1">
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
                placeholder="UUID d'agrégat (ex. a1b2c3…)"
                className="flex-1"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!application || !aggregateInput.trim()}
              >
                <SearchIcon className="size-4" aria-hidden />
                Rechercher
              </Button>
            </form>
          </FilterField>
        )}
      </FilterBar>

      {mode === "type" ? (
        byType.isPending ? (
          <LoadingState />
        ) : byType.error ? (
          <ErrorState error={byType.error} onRetry={() => void byType.refetch()} />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <h2 className="text-sm font-medium">
                Événements {type ? `de type ${type}` : "récents"}
                {application ? ` — ${application}` : " — toutes applications"}
              </h2>
              <Badge variant="outline">{byType.data?.length ?? 0} résultat(s)</Badge>
            </div>
            {byType.data && byType.data.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-2 font-medium">Horodatage</th>
                    <th className="px-4 py-2 font-medium">Application</th>
                    <th className="px-4 py-2 font-medium">Type</th>
                    <th className="px-4 py-2 font-medium">Agrégat</th>
                    <th className="px-4 py-2 font-medium">Séq.</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {byType.data.map((event) => (
                    <tr key={`${event.application}/${event.id}`}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {formatDateTime(event.timestamp)}
                      </td>
                      <td className="px-4 py-2 text-xs">{event.application}</td>
                      <td className="px-4 py-2 font-mono text-xs">{event.payloadType}</td>
                      <td className="px-4 py-2 font-mono text-xs">{event.aggregateId}</td>
                      <td className="px-4 py-2">{event.sequenceNumber}</td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAggregate(event.application, event.aggregateId)}
                        >
                          Voir l'agrégat
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                title="Aucun événement"
                description="Élargis la fenêtre temporelle ou choisis un autre type."
              />
            )}
          </div>
        )
      ) : !application ? (
        <p className="text-sm text-muted-foreground">
          Choisis une application pour interroger son event store.
        </p>
      ) : !aggregateId ? (
        <p className="text-sm text-muted-foreground">
          Saisis un identifiant d'agrégat puis lance la recherche, ou passe en mode « Par type ».
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
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <h2 className="text-sm font-medium">Snapshots</h2>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={withPayload}
                  onChange={(event) => setWithPayload(event.target.checked)}
                  className="size-4"
                />
                Inclure le payload
              </label>
            </div>
            {snapshots.data && snapshots.data.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-2 font-medium">Séquence</th>
                    <th className="px-4 py-2 font-medium">Type d'agrégat</th>
                    <th className="px-4 py-2 font-medium">Payload</th>
                    <th className="px-4 py-2 font-medium">Horodatage</th>
                    {withPayload ? <th className="px-4 py-2 font-medium">Contenu</th> : null}
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
                      {withPayload ? (
                        <td className="px-4 py-2">
                          {snapshot.payload ? (
                            <JsonViewer value={snapshot.payload} maxHeight={200} />
                          ) : (
                            "—"
                          )}
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-4 py-4 text-sm text-muted-foreground">Aucun snapshot.</p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
