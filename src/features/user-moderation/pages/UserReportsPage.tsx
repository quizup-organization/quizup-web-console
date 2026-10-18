import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Flag, RefreshCw, Search, ShieldAlert, UserX } from "lucide-react"

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
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/DataState"
import { FilterBar, FilterField } from "@/shared/components/FilterBar"
import { PageHeader } from "@/shared/components/PageHeader"
import { StatCard } from "@/shared/components/StatCard"
import {
  useReportedUserQueue,
  useUserModerationSearch,
  useUserModerationSummary,
} from "../hooks/useUserModeration"
import type {
  AdminReportedUserSummaryView,
  AdminUserSearchResultView,
  UserReportSort,
  UserReportStatus,
} from "../lib/user-moderation"

const ALL = "__all__"
const PAGE_SIZE = 20

export function UserReportsPage() {
  const summary = useUserModerationSummary()
  const [search, setSearch] = useState("")
  const searchQuery = useUserModerationSearch(search)

  return (
    <section className="space-y-4">
      <PageHeader
        title="Signalements joueurs"
        description="File de modération des comptes : signalements, suspension temporaire ou définitive, réactivation."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void summary.refetch()}
          >
            <RefreshCw className="size-4" />
            Rafraîchir
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Signalements ouverts"
          value={summary.data?.openReports ?? "—"}
          tone="warning"
        />
        <StatCard
          label="Joueurs signalés"
          value={summary.data?.reportedUsers ?? "—"}
        />
        <StatCard
          label="Comptes suspendus"
          value={summary.data?.suspendedUsers ?? "—"}
          tone="danger"
        />
      </div>

      <div className="space-y-2 rounded-lg border border-border bg-background p-3">
        <div className="flex items-center gap-2">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un joueur par pseudonyme, email ou identifiant"
            className="max-w-xl"
          />
        </div>
        {search.trim().length >= 2 ? (
          searchQuery.isLoading ? (
            <p className="text-xs text-muted-foreground">Recherche…</p>
          ) : searchQuery.isError ? (
            <p className="text-xs text-destructive">
              Recherche indisponible.
            </p>
          ) : searchQuery.data && searchQuery.data.length > 0 ? (
            <ul className="divide-y divide-border rounded-md border border-border">
              {searchQuery.data.map((result) => (
                <SearchResultRow key={result.userId} result={result} />
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">Aucun joueur trouvé.</p>
          )
        ) : null}
      </div>

      <ReportedUsersQueue />
    </section>
  )
}

function SearchResultRow({ result }: { result: AdminUserSearchResultView }) {
  const navigate = useNavigate()
  return (
    <li className="flex items-center gap-3 px-3 py-2">
      <Initials name={result.pseudonym ?? result.email} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {result.pseudonym ?? "Sans pseudonyme"}
        </p>
        <p className="truncate text-xs text-muted-foreground">{result.email}</p>
      </div>
      <UserStatusBadge suspended={result.suspended} />
      {result.protectedAccount ? (
        <Badge variant="outline">Protégé</Badge>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => void navigate(`/user-reports/${result.userId}`)}
        >
          Ouvrir
        </Button>
      )}
    </li>
  )
}

function ReportedUsersQueue() {
  const [status, setStatus] = useState<UserReportStatus>("OPEN")
  const [suspended, setSuspended] = useState(ALL)
  const [sort, setSort] = useState<UserReportSort>("RECENT_REPORT")
  const [page, setPage] = useState(0)
  const queue = useReportedUserQueue({
    status,
    suspended: suspended === ALL ? undefined : suspended === "true",
    sort,
    page,
    size: PAGE_SIZE,
  })

  return (
    <div className="space-y-3">
      <FilterBar>
        <FilterField label="Statut">
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus((value ?? "OPEN") as UserReportStatus)
              setPage(0)
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Ouverts</SelectItem>
              <SelectItem value="RESOLVED">Résolus</SelectItem>
              <SelectItem value="DISMISSED">Ignorés</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Compte">
          <Select
            value={suspended}
            onValueChange={(value) => {
              setSuspended(value ?? ALL)
              setPage(0)
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous</SelectItem>
              <SelectItem value="true">Suspendus</SelectItem>
              <SelectItem value="false">Actifs</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Tri">
          <Select
            value={sort}
            onValueChange={(value) => {
              setSort((value ?? "RECENT_REPORT") as UserReportSort)
              setPage(0)
            }}
          >
            <SelectTrigger className="w-[190px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RECENT_REPORT">Plus récent</SelectItem>
              <SelectItem value="OLDEST_REPORT">Plus ancien</SelectItem>
              <SelectItem value="MOST_REPORTED">Plus signalé</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </FilterBar>

      {queue.isLoading ? (
        <LoadingState rows={6} />
      ) : queue.isError ? (
        <ErrorState error={queue.error} onRetry={() => void queue.refetch()} />
      ) : !queue.data || queue.data.content.length === 0 ? (
        <EmptyState
          title="Aucun signalement"
          description="Aucun joueur ne correspond à ces filtres."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-background">
            <table className="w-full min-w-[880px] text-sm">
              <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2">Joueur</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Compte</th>
                  <th className="px-4 py-2">Signalements</th>
                  <th className="px-4 py-2">Dernier</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {queue.data.content.map((row) => (
                  <ReportedUserRow key={row.userId} row={row} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Page {queue.data.page + 1} /{" "}
              {Math.max(queue.data.totalPages, 1)}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={queue.data.first}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={queue.data.last}
                onClick={() => setPage((current) => current + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ReportedUserRow({ row }: { row: AdminReportedUserSummaryView }) {
  return (
    <tr>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <Initials name={row.pseudonym ?? row.userId} />
          <span className="font-medium">
            {row.pseudonym ?? "Sans pseudonyme"}
          </span>
        </div>
      </td>
      <td className="px-4 py-2 text-muted-foreground">{row.email ?? "—"}</td>
      <td className="px-4 py-2">
        <UserStatusBadge
          suspended={row.suspended}
          until={row.suspendedUntil}
        />
      </td>
      <td className="px-4 py-2">
        <Badge variant="secondary">
          <Flag className="size-3" />
          {row.openReportCount} / {row.totalReportCount}
        </Badge>
      </td>
      <td className="px-4 py-2 text-muted-foreground">
        {row.lastReportedAt ? formatDateTime(row.lastReportedAt) : "—"}
      </td>
      <td className="px-4 py-2 text-right">
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link to={`/user-reports/${row.userId}`} />}
        >
          Traiter
        </Button>
      </td>
    </tr>
  )
}

export function UserStatusBadge({
  suspended,
  until,
}: {
  suspended: boolean
  until?: string | null
}) {
  if (!suspended) {
    return <Badge variant="outline">Actif</Badge>
  }
  return (
    <Badge variant="destructive" title={until ? `Jusqu'au ${formatDateTime(until)}` : "Définitive"}>
      <ShieldAlert className="size-3" />
      Suspendu
    </Badge>
  )
}

export function Initials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
      {initials || <UserX className="size-3" />}
    </span>
  )
}
