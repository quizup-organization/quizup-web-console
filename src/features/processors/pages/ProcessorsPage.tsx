import { useState } from "react"
import { Link } from "react-router-dom"
import { RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDateTime } from "@/lib/format"
import { ApplicationSelect } from "@/shared/components/ApplicationSelect"
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/DataState"
import { FilterBar, FilterField } from "@/shared/components/FilterBar"
import { PageHeader } from "@/shared/components/PageHeader"
import { useApplications } from "@/features/applications"
import { useProcessors } from "../hooks/useProcessors"

export function ProcessorsPage() {
  const { data: instances } = useApplications()
  const applications = [
    ...new Set((instances ?? []).map((instance) => instance.application)),
  ].sort()

  const [application, setApplication] = useState("")
  const [nameFilter, setNameFilter] = useState("")
  const [errorsOnly, setErrorsOnly] = useState(false)
  const { data, isPending, error, refetch, isFetching } = useProcessors(
    application || undefined,
  )

  const processors = (data ?? []).filter(
    (processor) =>
      (!nameFilter || processor.name.toLowerCase().includes(nameFilter.toLowerCase())) &&
      (!errorsOnly || processor.error),
  )

  return (
    <section className="space-y-4">
      <PageHeader
        title="Event processors"
        description="État des processors par application et instance (segments, replay, erreurs)."
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
            includeAll
          />
        </FilterField>
        <FilterField label="Nom du processor" className="min-w-[240px] flex-1">
          <Input
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
            placeholder="Filtrer par nom (ex. game-projection)"
          />
        </FilterField>
        <FilterField label="État">
          <Button
            type="button"
            variant={errorsOnly ? "destructive" : "outline"}
            size="sm"
            className="h-9"
            onClick={() => setErrorsOnly((current) => !current)}
          >
            En erreur uniquement
          </Button>
        </FilterField>
        <span className="ml-auto text-xs text-muted-foreground">
          {processors.length} processor(s)
        </span>
      </FilterBar>

      {isPending ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : processors.length === 0 ? (
        <EmptyState
          title="Aucun processor"
          description="Aucune remontée d'agent pour ce filtre."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Application / instance</th>
                <th className="px-4 py-2 font-medium">Processor</th>
                <th className="px-4 py-2 font-medium">Mode</th>
                <th className="px-4 py-2 font-medium">État</th>
                <th className="px-4 py-2 font-medium">MAJ</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {processors.map((processor) => (
                <tr key={`${processor.application}/${processor.instanceId}/${processor.name}`}>
                  <td className="px-4 py-2">
                    <div className="font-medium">{processor.application}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {processor.instanceId}
                    </div>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{processor.name}</td>
                  <td className="px-4 py-2">{processor.mode}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {processor.error ? (
                        <Badge variant="destructive">erreur</Badge>
                      ) : null}
                      {processor.replaying ? (
                        <Badge variant="outline">replay</Badge>
                      ) : null}
                      {processor.running ? (
                        <Badge variant="secondary">démarré</Badge>
                      ) : (
                        <Badge variant="outline">arrêté</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatDateTime(processor.updatedAt)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="outline" size="sm" render={
                      <Link
                        to={`/processors/${encodeURIComponent(processor.application)}/${encodeURIComponent(processor.instanceId)}/${encodeURIComponent(processor.name)}`}
                      />
                    }>
                      Détail
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
