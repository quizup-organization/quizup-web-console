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
import { Pagination } from "@/shared/components/Pagination"
import { SegmentedTab, SegmentedTabs } from "@/shared/components/SegmentedTabs"
import { StatCard } from "@/shared/components/StatCard"
import {
  useReportedUserQueue,
  useUserCatalogue,
  useUserModerationSearch,
  useUserModerationSummary,
} from "../hooks/useUserModeration"
import type {
  AccountStatus,
  AdminReportedUserSummaryView,
  AdminUserCatalogueView,
  AdminUserSearchResultView,
  UserReportSort,
  UserReportStatus,
} from "../lib/user-moderation"

type Tab = "reports" | "catalogue"

const ALL = "__all__"
const PAGE_SIZE = 20

export function PlayersPage() {
  const [tab, setTab] = useState<Tab>("reports")
  const summary = useUserModerationSummary()

  return (
    <section className="space-y-4">
      <PageHeader
        title="Joueurs"
        description="Catalogue des joueurs, signalements et modération des comptes : suspension temporaire ou définitive, réactivation."
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

      <SegmentedTabs>
        <SegmentedTab
          active={tab === "reports"}
          onClick={() => setTab("reports")}
        >
          Signalements
        </SegmentedTab>
        <SegmentedTab
          active={tab === "catalogue"}
          onClick={() => setTab("catalogue")}
        >
          Catalogue
        </SegmentedTab>
      </SegmentedTabs>

      {tab === "reports" ? <ReportedUsersTab /> : <UserCatalogueTab />}
    </section>
  )
}

function ReportedUsersTab() {
  const [search, setSearch] = useState("")
  const searchQuery = useUserModerationSearch(search)

  return (
    <div className="space-y-3">
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
            <p className="text-xs text-destructive">Recherche indisponible.</p>
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
    </div>
  )
}

function UserCatalogueTab() {
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState(ALL)
  const [reportedOnly, setReportedOnly] = useState(ALL)
  const [page, setPage] = useState(0)
  const catalogue = useUserCatalogue({
    q: query || undefined,
    status: status === ALL ? undefined : (status as AccountStatus),
    reportedOnly: reportedOnly === "true",
    page,
    size: PAGE_SIZE,
  })

  return (
    <div className="space-y-3">
      <FilterBar>
        <FilterField label="Recherche" className="min-w-[240px] flex-1">
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              setQuery(search.trim())
              setPage(0)
            }}
          >
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pseudonyme, email ou identifiant…"
            />
            <Button type="submit" variant="outline" size="sm">
              Filtrer
            </Button>
          </form>
        </FilterField>
        <FilterField label="Compte">
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value ?? ALL)
              setPage(0)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous</SelectItem>
              <SelectItem value="ACTIVE">Actifs</SelectItem>
              <SelectItem value="SUSPENDED">Suspendus</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Signalements">
          <Select
            value={reportedOnly}
            onValueChange={(value) => {
              setReportedOnly(value ?? ALL)
              setPage(0)
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous</SelectItem>
              <SelectItem value="true">Signalés</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </FilterBar>

      {catalogue.isPending ? (
        <LoadingState rows={6} />
      ) : catalogue.isError ? (
        <ErrorState
          error={catalogue.error}
          onRetry={() => void catalogue.refetch()}
        />
      ) : !catalogue.data || catalogue.data.content.length === 0 ? (
        <EmptyState
          title="Aucun joueur"
          description="Aucun joueur ne correspond aux filtres."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-background">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2 font-medium">Joueur</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Compte</th>
                  <th className="px-4 py-2 font-medium">Signalements</th>
                  <th className="px-4 py-2 font-medium">Dernier</th>
                  <th className="px-4 py-2 font-medium">Inscrit le</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {catalogue.data.content.map((user) => (
                  <UserCatalogueRow key={user.userId} user={user} />
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={catalogue.data.page}
            totalPages={catalogue.data.totalPages}
            onPage={setPage}
          />
        </>
      )}
    </div>
  )
}

function UserCatalogueRow({ user }: { user: AdminUserCatalogueView }) {
  return (
    <tr>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <Initials name={user.pseudonym ?? user.email} />
          <span className="font-medium">
            {user.pseudonym ?? "Sans pseudonyme"}
          </span>
          {user.protectedAccount ? (
            <Badge variant="outline">Protégé</Badge>
          ) : null}
        </div>
      </td>
      <td className="px-4 py-2 text-muted-foreground">{user.email}</td>
      <td className="px-4 py-2">
        <UserStatusBadge
          suspended={user.suspended}
          until={user.suspendedUntil}
        />
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        {user.totalReportCount === 0 ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <Badge variant="outline">
            <Flag className="size-3" />
            {user.openReportCount} ouvert(s) / {user.totalReportCount}
          </Badge>
        )}
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
        {user.lastReportedAt ? formatDateTime(user.lastReportedAt) : "—"}
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
        {formatDateTime(user.createdAt)}
      </td>
      <td className="px-4 py-2 text-right">
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link to={`/user-reports/${user.userId}`} />}
        >
          Ouvrir
        </Button>
      </td>
    </tr>
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
      <UserStatusBadge
        suspended={result.suspended}
        until={result.suspendedUntil}
      />
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
          <Pagination
            page={queue.data.page}
            totalPages={queue.data.totalPages}
            onPage={setPage}
          />
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
