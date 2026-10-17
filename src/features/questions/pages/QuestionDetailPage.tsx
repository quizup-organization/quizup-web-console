import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  Check,
  Flag,
  ImagePlus,
  Pencil,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatDateTime } from "@/lib/format"
import { queryKeys } from "@/lib/query-keys"
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/DataState"
import { PageHeader } from "@/shared/components/PageHeader"
import {
  useQuestionDetail,
  useQuestionModeration,
  useResolveQuestionReports,
  useUploadQuestionImage,
} from "../hooks/useQuestions"
import {
  questionsService,
  type AdminQuestionReportView,
  type AdminQuestionView,
  type AnswerView,
  type Language,
  type QuestionChoice,
  type QuestionModerationInput,
  type QuestionReportReason,
} from "../lib/questions"

const REASON_LABELS: Record<QuestionReportReason, string> = {
  QUESTION: "Énoncé",
  IMAGE: "Image",
  ANSWERS: "Réponses",
}

export function QuestionDetailPage() {
  const { questionId = "" } = useParams<{ questionId: string }>()
  const detail = useQuestionDetail(questionId)

  if (detail.isPending) return <LoadingState rows={8} />
  if (detail.error) {
    return <ErrorState error={detail.error} onRetry={() => void detail.refetch()} />
  }
  if (!detail.data) {
    return <EmptyState title="Question introuvable" />
  }

  return (
    <section className="space-y-4">
      <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/questions" />}>
        <ArrowLeft /> Retour
      </Button>
      <PageHeader
        title="Question"
        description={detail.data.question.topic.names.fr ?? detail.data.question.topic.topicId}
      />
      <QuestionEditorPanel
        key={`${questionId}:${detail.data.question.updatedAt ?? ""}`}
        question={detail.data.question}
      />
      <ReportsPanel
        questionId={questionId}
        reports={detail.data.reports}
      />
    </section>
  )
}

function QuestionEditorPanel({ question }: { question: AdminQuestionView }) {
  const queryClient = useQueryClient()
  const upload = useUploadQuestionImage()
  const moderation = useQuestionModeration(question.questionId)
  const [french, setFrench] = useState<ContentDraft>(() => toDraft(question, "fr"))
  const [english, setEnglish] = useState<ContentDraft | null>(() =>
    question.contents.some((content) => content.language === "en")
      ? toDraft(question, "en")
      : null,
  )
  const [correctAnswer, setCorrectAnswer] = useState<QuestionChoice>(
    question.correctAnswer,
  )
  const [imageUrl, setImageUrl] = useState(question.imageUrl ?? "")
  const [saving, setSaving] = useState(false)

  const originalLanguages = useMemo(
    () => new Set(question.contents.map((content) => content.language)),
    [question.contents],
  )

  const save = async () => {
    setSaving(true)
    try {
      for (const draft of [french, english].filter(Boolean) as ContentDraft[]) {
        const answers = toAnswers(draft)
        if (originalLanguages.has(draft.language)) {
          await questionsService.updateText(
            question.questionId,
            draft.language,
            draft.text,
          )
          await questionsService.updateAnswers(
            question.questionId,
            draft.language,
            answers,
          )
        } else if (draft.text.trim()) {
          await questionsService.addTranslation(question.questionId, {
            language: draft.language,
            text: draft.text,
            answers,
          })
        }
      }
      await questionsService.updateCorrectAnswer(
        question.questionId,
        correctAnswer,
      )
      await questionsService.updateImageUrl(
        question.questionId,
        imageUrl.trim() || null,
      )
      toast.success("Question mise à jour")
      await queryClient.invalidateQueries({ queryKey: queryKeys.questions.all })
    } catch {
      toast.error("Impossible d'enregistrer la question")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={question.status} />
        {question.suspended && (
          <Badge variant="destructive">
            Suspendue
            {question.suspensionReason === "AUTO_REPORT_THRESHOLD"
              ? " · auto"
              : ""}
          </Badge>
        )}
        {question.archived && <Badge variant="secondary">Archivée</Badge>}
        <Badge variant="outline">
          <Flag className="size-3" /> {question.openReportCount} ouvert(s) /{" "}
          {question.totalReportCount}
        </Badge>
        <span className="ml-auto text-xs text-muted-foreground">
          Mise à jour {formatDateTime(question.updatedAt)}
        </span>
      </div>

      {question.suspensionNote && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
          {question.suspensionNote}
        </p>
      )}
      {question.archiveNote && (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          {question.archiveNote}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <ContentEditor
          label="Français"
          draft={french}
          onChange={setFrench}
        />
        {english ? (
          <ContentEditor
            label="Anglais"
            draft={english}
            onChange={setEnglish}
          />
        ) : (
          <div className="flex flex-col items-start justify-center gap-2 rounded-lg border border-dashed border-border p-4">
            <p className="text-sm text-muted-foreground">
              Aucune traduction anglaise.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setEnglish({
                  language: "en",
                  text: "",
                  answers: { A: "", B: "", C: "", D: "" },
                })
              }
            >
              Ajouter l'anglais
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-xs text-muted-foreground">
          Bonne réponse
          <Select
            value={correctAnswer}
            onValueChange={(value) => setCorrectAnswer(value as QuestionChoice)}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["A", "B", "C", "D"] as QuestionChoice[]).map((choice) => (
                <SelectItem key={choice} value={choice}>
                  {choice}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="block text-xs text-muted-foreground">
          Image (URL)
          <Input
            className="mt-1"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://…"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => void save()} disabled={saving}>
          <Pencil /> {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/40">
          <ImagePlus className="size-4" />
          Téléverser une image
          <input
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              upload.mutate(file, {
                onSuccess: (media) => setImageUrl(media.url),
              })
              event.target.value = ""
            }}
          />
        </label>
        {imageUrl && (
          <Button variant="ghost" size="sm" onClick={() => setImageUrl("")}>
            <Trash2 /> Retirer l'image
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-3">
        {question.status !== "APPROVED" && (
          <Button
            size="sm"
            variant="outline"
            disabled={moderation.isPending}
            onClick={() => moderation.mutate({ action: "approve" })}
          >
            <Check /> Approuver
          </Button>
        )}
        {question.status !== "REJECTED" && (
          <Button
            size="sm"
            variant="outline"
            disabled={moderation.isPending}
            onClick={() =>
              confirm("Retirer cette question du jeu (rejet) ?") &&
              moderation.mutate({ action: "reject" })
            }
          >
            <X /> Retirer
          </Button>
        )}
        {question.status === "APPROVED" && !question.suspended ? (
          <Button
            size="sm"
            variant="outline"
            disabled={moderation.isPending}
            onClick={() => {
              if (!confirm("Suspendre cette question ?")) return
              const input: QuestionModerationInput = {
                note: window.prompt("Motif de la suspension (optionnel)") ?? undefined,
              }
              moderation.mutate({ action: "suspend", input })
            }}
          >
            <ShieldAlert /> Suspendre
          </Button>
        ) : question.suspended ? (
          <Button
            size="sm"
            variant="outline"
            disabled={moderation.isPending}
            onClick={() => {
              const closeReports = confirm(
                "Réactiver la question et clôturer les signalements ouverts ?",
              )
              moderation.mutate({
                action: "reinstate",
                input: { resolveOpenReports: closeReports },
              })
            }}
          >
            <ShieldCheck /> Réactiver
          </Button>
        ) : null}
        {!question.archived ? (
          <Button
            size="sm"
            variant="destructive"
            disabled={moderation.isPending}
            onClick={() => {
              const closeReports = confirm(
                "Archiver la question et clôturer les signalements ouverts ?",
              )
              moderation.mutate({
                action: "archive",
                input: { resolveOpenReports: closeReports },
              })
            }}
          >
            <Trash2 /> Archiver
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={moderation.isPending}
            onClick={() => moderation.mutate({ action: "restore" })}
          >
            <RotateCcw /> Restaurer
          </Button>
        )}
      </div>
    </div>
  )
}

function ReportsPanel({
  questionId,
  reports,
}: {
  questionId: string
  reports: AdminQuestionReportView[]
}) {
  const [note, setNote] = useState("")
  const resolve = useResolveQuestionReports(questionId)
  const openReports = reports.filter((report) => report.status === "OPEN")

  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Signalements</h2>
        <Badge variant="outline">
          {openReports.length} ouvert(s) / {reports.length}
        </Badge>
      </div>

      {reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun signalement.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <ReportCard
              key={report.reportId}
              report={report}
              busy={resolve.isPending}
              onResolve={() =>
                resolve.mutate({
                  reportId: report.reportId,
                  input: { resolution: "RESOLVED", note: note.trim() || undefined },
                })
              }
              onDismiss={() =>
                resolve.mutate({
                  reportId: report.reportId,
                  input: { resolution: "DISMISSED", note: note.trim() || undefined },
                })
              }
            />
          ))}
        </div>
      )}

      {openReports.length > 0 && (
        <div className="space-y-2 border-t border-border pt-3">
          <Label htmlFor="admin-report-note">Note de clôture (optionnel)</Label>
          <Textarea
            id="admin-report-note"
            value={note}
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
          />
          <Button
            size="sm"
            disabled={resolve.isPending}
            onClick={() =>
              resolve.mutate({
                input: { resolution: "RESOLVED", note: note.trim() || undefined },
              })
            }
          >
            <Check /> Tout clôturer
          </Button>
        </div>
      )}
    </div>
  )
}

function ReportCard({
  report,
  busy,
  onResolve,
  onDismiss,
}: {
  report: AdminQuestionReportView
  busy: boolean
  onResolve: () => void
  onDismiss: () => void
}) {
  return (
    <article className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {report.reasons.map((reason) => (
          <Badge key={reason} variant="secondary">
            {REASON_LABELS[reason]}
          </Badge>
        ))}
        <Badge variant={report.status === "OPEN" ? "destructive" : "outline"}>
          {report.status === "OPEN"
            ? "Ouvert"
            : report.status === "RESOLVED"
              ? "Résolu"
              : "Ignoré"}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {report.reporterPseudonym ?? report.reporterId}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {formatDateTime(report.createdAt)}
        </span>
      </div>

      {report.snapshot && (
        <div className="mt-2 rounded-md border border-border bg-muted/30 p-2 text-xs">
          <p className="font-medium">{report.snapshot.questionText}</p>
          {report.snapshot.imageUrl && (
            <img
              src={report.snapshot.imageUrl}
              alt=""
              className="mt-1 max-h-24 rounded object-contain"
            />
          )}
          <p className="mt-1 text-muted-foreground">
            Bonne réponse : {report.snapshot.correctAnswer ?? "—"} ·{" "}
            {report.snapshot.source === "PLAYED" ? "version jouée" : "version actuelle"}
          </p>
        </div>
      )}

      {report.comment && <p className="mt-2 text-sm">{report.comment}</p>}
      {report.resolutionNote && (
        <p className="mt-2 text-xs text-muted-foreground">
          Note de clôture : {report.resolutionNote}
        </p>
      )}

      {report.status === "OPEN" && (
        <div className="mt-3 flex justify-end gap-1.5">
          <Button size="sm" variant="ghost" onClick={onDismiss} disabled={busy}>
            <X /> Ignorer
          </Button>
          <Button size="sm" variant="outline" onClick={onResolve} disabled={busy}>
            <Check /> Résoudre
          </Button>
        </div>
      )}
    </article>
  )
}

interface ContentDraft {
  language: Language
  text: string
  answers: Record<QuestionChoice, string>
}

function ContentEditor({
  label,
  draft,
  onChange,
}: {
  label: string
  draft: ContentDraft
  onChange: (draft: ContentDraft) => void
}) {
  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase">
        {label}
      </p>
      <Textarea
        value={draft.text}
        maxLength={255}
        onChange={(event) => onChange({ ...draft, text: event.target.value })}
        rows={2}
      />
      {(["A", "B", "C", "D"] as QuestionChoice[]).map((choice) => (
        <Input
          key={choice}
          value={draft.answers[choice]}
          placeholder={`Réponse ${choice}`}
          onChange={(event) =>
            onChange({
              ...draft,
              answers: { ...draft.answers, [choice]: event.target.value },
            })
          }
        />
      ))}
    </div>
  )
}

function toDraft(question: AdminQuestionView, language: Language): ContentDraft {
  const content = question.contents.find(
    (candidate) => candidate.language === language,
  )
  const answers: Record<QuestionChoice, string> = { A: "", B: "", C: "", D: "" }
  content?.answers.forEach((answer) => {
    answers[answer.choice] = answer.text
  })
  return { language, text: content?.text ?? "", answers }
}

function toAnswers(draft: ContentDraft): AnswerView[] {
  return (["A", "B", "C", "D"] as QuestionChoice[]).map((choice) => ({
    choice,
    text: draft.answers[choice],
  }))
}

function StatusBadge({
  status,
}: {
  status: "PENDING" | "APPROVED" | "REJECTED"
}) {
  const tone =
    status === "APPROVED"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
      : status === "REJECTED"
        ? "border-destructive/40 bg-destructive/10 text-destructive"
        : "border-amber-500/40 bg-amber-500/10 text-amber-700"
  return (
    <Badge variant="outline" className={tone}>
      {status === "APPROVED"
        ? "Approuvée"
        : status === "REJECTED"
          ? "Rejetée"
          : "En attente"}
    </Badge>
  )
}
