import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Check,
  Flag,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { formatDateTime } from "@/lib/format"
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/DataState"
import { Modal } from "@/shared/components/Modal"
import { PageHeader } from "@/shared/components/PageHeader"
import {
  useReinstateUser,
  useResolveUserReports,
  useSuspendUser,
  useUserModerationDetail,
} from "../hooks/useUserModeration"
import {
  USER_SUSPENSION_REASON_LABELS,
  type AdminUserReportView,
  type UserReportResolution,
  type UserSuspensionReason,
} from "../lib/user-moderation"

export function UserModerationDetailPage() {
  const { userId = "" } = useParams<{ userId: string }>()
  const detail = useUserModerationDetail(userId)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [reinstateOpen, setReinstateOpen] = useState(false)

  if (detail.isLoading) {
    return <LoadingState rows={8} />
  }
  if (detail.isError) {
    return <ErrorState error={detail.error} onRetry={() => void detail.refetch()} />
  }
  if (!detail.data) {
    return <EmptyState title="Joueur introuvable" />
  }

  const { account, profile, reports } = detail.data
  const name = profile?.pseudonym ?? account.email
  const openReports = reports.filter((report) => report.status === "OPEN").length

  return (
    <section className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        className="px-0"
        nativeButton={false}
        render={<Link to="/user-reports" />}
      >
        <ArrowLeft className="size-4" />
        Retour
      </Button>

      <PageHeader
        title={name}
        description={`Dossier de modération · ${account.email}`}
        actions={
          <div className="flex gap-2">
            {account.suspended ? (
              <Button
                variant="outline"
                size="sm"
                disabled={account.protectedAccount}
                onClick={() => setReinstateOpen(true)}
              >
                <ShieldCheck className="size-4" />
                Réactiver
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                disabled={account.protectedAccount}
                onClick={() => setSuspendOpen(true)}
              >
                <ShieldAlert className="size-4" />
                Suspendre
              </Button>
            )}
          </div>
        }
      />

      {account.protectedAccount ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Compte système protégé : aucune sanction ne peut être appliquée.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-background p-4">
            <h2 className="text-sm font-semibold">Compte</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Statut">
                <StatusBadge
                  suspended={account.suspended}
                  until={account.suspendedUntil}
                />
              </Row>
              <Row label="Email">{account.email}</Row>
              <Row label="Identifiant">
                <span className="font-mono text-xs">{account.userId}</span>
              </Row>
              <Row label="Créé le">{formatDateTime(account.createdAt)}</Row>
              {account.suspended ? (
                <>
                  <Row label="Motif">
                    {account.suspensionReason
                      ? USER_SUSPENSION_REASON_LABELS[
                          account.suspensionReason
                        ]
                      : "—"}
                  </Row>
                  <Row label="Échéance">
                    {account.suspendedUntil
                      ? formatDateTime(account.suspendedUntil)
                      : "Définitive"}
                  </Row>
                  <Row label="Suspendu par">{account.suspendedBy ?? "—"}</Row>
                  <Row label="Note interne">
                    {account.suspensionNote ?? "—"}
                  </Row>
                </>
              ) : account.reinstatedAt ? (
                <>
                  <Row label="Réactivé le">
                    {formatDateTime(account.reinstatedAt)}
                  </Row>
                  <Row label="Réactivé par">
                    {account.reinstatedBy ?? "—"}
                  </Row>
                </>
              ) : null}
            </dl>
          </div>

          <div className="rounded-lg border border-border bg-background p-4">
            <h2 className="text-sm font-semibold">Profil public</h2>
            {profile ? (
              <dl className="mt-3 space-y-2 text-sm">
                <Row label="Pseudonyme">{profile.pseudonym ?? "—"}</Row>
                <Row label="Bio">{profile.bio ?? "—"}</Row>
                <Row label="Pays">{profile.country ?? "—"}</Row>
              </dl>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Profil indisponible.
              </p>
            )}
          </div>
        </div>

        <ReportsPanel
          userId={userId}
          reports={reports}
          openReports={openReports}
        />
      </div>

      <SuspendUserModal
        userId={userId}
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
      />
      <ReinstateUserModal
        userId={userId}
        open={reinstateOpen}
        onClose={() => setReinstateOpen(false)}
      />
    </section>
  )
}

function ReportsPanel({
  userId,
  reports,
  openReports,
}: {
  userId: string
  reports: AdminUserReportView[]
  openReports: number
}) {
  const resolve = useResolveUserReports(userId)
  const [note, setNote] = useState("")

  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">
          Signalements{" "}
          <Badge variant="secondary" className="ml-1">
            <Flag className="size-3" />
            {openReports} ouverts / {reports.length}
          </Badge>
        </h2>
        {openReports > 0 ? (
          <Button
            size="sm"
            variant="outline"
            disabled={resolve.isPending}
            onClick={() =>
              resolve.mutate({
                input: { resolution: "RESOLVED", note: note.trim() || undefined },
              })
            }
          >
            <Check className="size-4" />
            Tout clôturer
          </Button>
        ) : null}
      </div>

      {openReports > 0 ? (
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
          placeholder="Note de clôture commune (optionnel)"
        />
      ) : null}

      {reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun signalement.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <ReportCard
              key={report.reportId}
              report={report}
              pending={resolve.isPending}
              onResolve={(resolution) =>
                resolve.mutate({
                  reportId: report.reportId,
                  input: {
                    resolution,
                    note: note.trim() || undefined,
                  },
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ReportCard({
  report,
  pending,
  onResolve,
}: {
  report: AdminUserReportView
  pending: boolean
  onResolve: (resolution: UserReportResolution) => void
}) {
  return (
    <article className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        {report.reasons.map((reason) => (
          <Badge key={reason} variant="secondary">
            {USER_SUSPENSION_REASON_LABELS[reason]}
          </Badge>
        ))}
        <ReportStatusBadge status={report.status} />
        <span className="ml-auto text-xs text-muted-foreground">
          {formatDateTime(report.createdAt)}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Signalé par{" "}
        <span className="font-medium text-foreground">
          {report.reporterPseudonym ?? report.reporterId}
        </span>
        {report.context === "GAME" && report.gameId
          ? ` · partie ${report.gameId}`
          : " · depuis le profil"}
      </p>
      {report.snapshot ? (
        <div className="mt-2 rounded-md bg-muted/50 p-2 text-xs">
          <p className="font-medium">Au moment du signalement</p>
          <p>{report.snapshot.pseudonym ?? "Pseudonyme inconnu"}</p>
        </div>
      ) : null}
      {report.comment ? (
        <p className="mt-2 whitespace-pre-wrap text-sm">{report.comment}</p>
      ) : null}
      {report.resolutionNote ? (
        <p className="mt-2 rounded-md bg-emerald-50 p-2 text-xs text-emerald-800">
          Clôture : {report.resolutionNote}
        </p>
      ) : null}
      {report.status === "OPEN" ? (
        <div className="mt-3 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => onResolve("DISMISSED")}
          >
            <X className="size-4" />
            Ignorer
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => onResolve("RESOLVED")}
          >
            <Check className="size-4" />
            Résoudre
          </Button>
        </div>
      ) : null}
    </article>
  )
}

function SuspendUserModal({
  userId,
  open,
  onClose,
}: {
  userId: string
  open: boolean
  onClose: () => void
}) {
  const suspend = useSuspendUser(userId)
  const [reason, setReason] = useState<UserSuspensionReason>("HARASSMENT")
  const [mode, setMode] = useState("P7D")
  const [customDays, setCustomDays] = useState("7")
  const [note, setNote] = useState("")
  const [resolveOpenReports, setResolveOpenReports] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const permanent = mode === "permanent"
  const custom = mode === "custom"

  const submit = () => {
    if (custom && (!Number.isInteger(Number(customDays)) || Number(customDays) < 1)) {
      setError("La durée personnalisée doit être un nombre de jours positif.")
      return
    }
    setError(null)
    suspend.mutate(
      {
        reason,
        note: note.trim() || undefined,
        permanent,
        duration: permanent
          ? undefined
          : custom
            ? `P${Number(customDays)}D`
            : mode,
        resolveOpenReports,
      },
      {
        onSuccess: () => {
          setNote("")
          onClose()
        },
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Suspendre le compte"
      description="Le joueur sera déconnecté immédiatement et ne pourra plus se connecter."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={suspend.isPending}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={submit}
            disabled={suspend.isPending}
          >
            {suspend.isPending ? "Suspension…" : "Suspendre"}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Motif</label>
          <Select
            value={reason}
            onValueChange={(value) =>
              setReason((value ?? "HARASSMENT") as UserSuspensionReason)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(USER_SUSPENSION_REASON_LABELS).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Durée</label>
          <Select
            value={mode}
            onValueChange={(value) => setMode(value ?? "P7D")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="P1D">24 heures</SelectItem>
              <SelectItem value="P7D">7 jours</SelectItem>
              <SelectItem value="P30D">30 jours</SelectItem>
              <SelectItem value="custom">Personnalisée (jours)</SelectItem>
              <SelectItem value="permanent">Définitive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {custom ? (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              Nombre de jours
            </label>
            <Input
              type="number"
              min={1}
              max={3650}
              value={customDays}
              onChange={(event) => setCustomDays(event.target.value)}
            />
          </div>
        ) : null}

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Note interne (jamais visible par le joueur)
          </label>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            placeholder="Contexte de la décision…"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={resolveOpenReports}
            onChange={(event) => setResolveOpenReports(event.target.checked)}
          />
          Clôturer les signalements ouverts après la suspension
        </label>

        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </Modal>
  )
}

function ReinstateUserModal({
  userId,
  open,
  onClose,
}: {
  userId: string
  open: boolean
  onClose: () => void
}) {
  const reinstate = useReinstateUser(userId)
  const [note, setNote] = useState("")

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Réactiver le compte"
      description="Le joueur pourra se reconnecter immédiatement."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={reinstate.isPending}>
            Annuler
          </Button>
          <Button
            onClick={() =>
              reinstate.mutate(note.trim() || undefined, {
                onSuccess: () => {
                  setNote("")
                  onClose()
                },
              })
            }
            disabled={reinstate.isPending}
          >
            {reinstate.isPending ? "Réactivation…" : "Réactiver"}
          </Button>
        </>
      }
    >
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">
          Note interne (optionnel)
        </label>
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
        />
      </div>
    </Modal>
  )
}

function StatusBadge({
  suspended,
  until,
}: {
  suspended: boolean
  until: string | null
}) {
  return suspended ? (
    <Badge
      variant="destructive"
      title={until ? `Jusqu'au ${formatDateTime(until)}` : "Définitive"}
    >
      <ShieldAlert className="size-3" />
      Suspendu
    </Badge>
  ) : (
    <Badge variant="outline">Actif</Badge>
  )
}

function ReportStatusBadge({
  status,
}: {
  status: "OPEN" | "RESOLVED" | "DISMISSED"
}) {
  if (status === "OPEN") {
    return <Badge variant="destructive">Ouvert</Badge>
  }
  if (status === "RESOLVED") {
    return <Badge variant="outline">Résolu</Badge>
  }
  return <Badge variant="outline">Ignoré</Badge>
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  )
}
