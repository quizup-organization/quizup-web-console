import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Flag, Plus, RefreshCw } from "lucide-react"

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
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/DataState"
import { FilterBar, FilterField } from "@/shared/components/FilterBar"
import { Modal } from "@/shared/components/Modal"
import { PageHeader } from "@/shared/components/PageHeader"
import { Pagination } from "@/shared/components/Pagination"
import { SegmentedTab, SegmentedTabs } from "@/shared/components/SegmentedTabs"
import { StatCard } from "@/shared/components/StatCard"
import {
  useCreateQuestion,
  useQuestionList,
  useQuestionQueue,
  useQuestionSummary,
  useQuestionTopics,
} from "../hooks/useQuestions"
import type {
  AdminQuestionSummaryView,
  AdminQuestionView,
  QuestionChoice,
  QuestionDifficulty,
  QuestionModeration,
  QuestionReportSort,
  QuestionReportStatus,
  QuestionStatus,
} from "../lib/questions"

type Tab = "reports" | "catalogue"

const ALL = "__all__"

export function QuestionsPage() {
  const [tab, setTab] = useState<Tab>("reports")
  const summary = useQuestionSummary()

  return (
    <section className="space-y-4">
      <PageHeader
        title="Questions"
        description="Signalements, catalogue global, correction, suspension et archivage des questions."
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Signalements ouverts"
          value={summary.data?.openReports ?? "—"}
          tone="warning"
        />
        <StatCard
          label="Questions signalées"
          value={summary.data?.reportedQuestions ?? "—"}
        />
        <StatCard
          label="Questions suspendues"
          value={summary.data?.suspendedQuestions ?? "—"}
          tone="danger"
        />
        <StatCard
          label="Questions archivées"
          value={summary.data?.archivedQuestions ?? "—"}
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

      {tab === "reports" ? <ReportedQuestionsTab /> : <QuestionCatalogueTab />}
    </section>
  )
}

function ReportedQuestionsTab() {
  const navigate = useNavigate()
  const topics = useQuestionTopics()
  const [status, setStatus] = useState<QuestionReportStatus>("OPEN")
  const [topicId, setTopicId] = useState(ALL)
  const [suspended, setSuspended] = useState(ALL)
  const [sort, setSort] = useState<QuestionReportSort>("RECENT_REPORT")
  const [page, setPage] = useState(0)
  const queue = useQuestionQueue({
    status,
    topicId: topicId === ALL ? undefined : topicId,
    suspended: suspended === ALL ? undefined : suspended === "true",
    sort,
    page,
    size: 20,
  })

  return (
    <div className="space-y-3">
      <FilterBar>
        <FilterField label="Statut">
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus((value ?? "OPEN") as QuestionReportStatus)
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
        <FilterField label="Sujet">
          <TopicSelect
            value={topicId}
            topics={topics.data ?? []}
            onChange={(value) => {
              setTopicId(value)
              setPage(0)
            }}
          />
        </FilterField>
        <FilterField label="Suspension">
          <Select
            value={suspended}
            onValueChange={(value) => {
              setSuspended(value ?? ALL)
              setPage(0)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes</SelectItem>
              <SelectItem value="true">Suspendues</SelectItem>
              <SelectItem value="false">Non suspendues</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Tri">
          <Select
            value={sort}
            onValueChange={(value) => setSort(value as QuestionReportSort)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RECENT_REPORT">Plus récents</SelectItem>
              <SelectItem value="OLDEST_REPORT">Plus anciens</SelectItem>
              <SelectItem value="MOST_REPORTED">Plus signalés</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </FilterBar>

      <DataState
        query={queue}
        emptyTitle="Aucun signalement"
        emptyDescription="Aucune question ne correspond aux filtres."
      >
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Question</th>
                <th className="px-4 py-2 font-medium">Sujet</th>
                <th className="px-4 py-2 font-medium">État</th>
                <th className="px-4 py-2 font-medium">Signalements</th>
                <th className="px-4 py-2 font-medium">Dernier</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {queue.data?.content.map((question) => (
                <ReportSummaryRow
                  key={question.questionId}
                  question={question}
                  onOpen={() => void navigate(`/questions/${question.questionId}`)}
                />
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={queue.data?.page ?? 0}
          totalPages={queue.data?.totalPages ?? 0}
          onPage={setPage}
        />
      </DataState>
    </div>
  )
}

function ReportSummaryRow({
  question,
  onOpen,
}: {
  question: AdminQuestionSummaryView
  onOpen: () => void
}) {
  return (
    <tr>
      <td className="max-w-[420px] px-4 py-2">
        <div className="flex items-center gap-2">
          {question.imageUrl ? (
            <img
              src={question.imageUrl}
              alt=""
              className="size-9 rounded object-cover"
            />
          ) : (
            <span className="grid size-9 place-items-center rounded bg-muted text-xs">
              —
            </span>
          )}
          <span className="truncate">{question.texts.fr ?? question.texts.en ?? "—"}</span>
        </div>
      </td>
      <td className="px-4 py-2 text-muted-foreground">
        {question.topic.names.fr ?? question.topic.topicId}
      </td>
      <td className="px-4 py-2">
        <div className="flex flex-wrap gap-1">
          <StatusBadge status={question.status} />
          {question.suspended && <Badge variant="destructive">Suspendue</Badge>}
          {question.archived && <Badge variant="secondary">Archivée</Badge>}
        </div>
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <Badge variant="outline">
          <Flag className="size-3" />
          {question.openReportCount} ouvert(s) / {question.totalReportCount}
        </Badge>
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
        {formatDateTime(question.lastReportedAt)}
      </td>
      <td className="px-4 py-2 text-right">
        <Button size="sm" variant="outline" onClick={onOpen}>
          Traiter
        </Button>
      </td>
    </tr>
  )
}

function QuestionCatalogueTab() {
  const navigate = useNavigate()
  const topics = useQuestionTopics()
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [topicId, setTopicId] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const [difficulty, setDifficulty] = useState(ALL)
  const [moderation, setModeration] = useState<QuestionModeration>("ALL")
  const [reportedOnly, setReportedOnly] = useState(ALL)
  const [page, setPage] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const list = useQuestionList({
    q: query || undefined,
    topicId: topicId === ALL ? undefined : topicId,
    status: status === ALL ? undefined : (status as QuestionStatus),
    difficulty: difficulty === ALL ? undefined : (difficulty as QuestionDifficulty),
    moderation,
    reportedOnly: reportedOnly === "true",
    page,
    size: 20,
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
              placeholder="Texte, identifiant…"
            />
            <Button type="submit" variant="outline" size="sm">
              Filtrer
            </Button>
          </form>
        </FilterField>
        <FilterField label="Sujet">
          <TopicSelect
            value={topicId}
            topics={topics.data ?? []}
            onChange={(value) => {
              setTopicId(value)
              setPage(0)
            }}
          />
        </FilterField>
        <FilterField label="Statut">
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value ?? ALL)
              setPage(0)
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="APPROVED">Approuvées</SelectItem>
              <SelectItem value="REJECTED">Rejetées</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Difficulté">
          <Select
            value={difficulty}
            onValueChange={(value) => {
              setDifficulty(value ?? ALL)
              setPage(0)
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes</SelectItem>
              <SelectItem value="EASY">Facile</SelectItem>
              <SelectItem value="MEDIUM">Moyenne</SelectItem>
              <SelectItem value="HARD">Difficile</SelectItem>
              <SelectItem value="EXPERT">Expert</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Modération">
          <Select
            value={moderation}
            onValueChange={(value) => {
              setModeration((value ?? "ALL") as QuestionModeration)
              setPage(0)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes (non archivées)</SelectItem>
              <SelectItem value="ACTIVE">Actives</SelectItem>
              <SelectItem value="SUSPENDED">Suspendues</SelectItem>
              <SelectItem value="ARCHIVED">Archivées</SelectItem>
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
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes</SelectItem>
              <SelectItem value="true">Signalées</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus /> Nouvelle question
        </Button>
      </FilterBar>

      <DataState
        query={list}
        emptyTitle="Aucune question"
        emptyDescription="Aucune question ne correspond aux filtres."
      >
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Question</th>
                <th className="px-4 py-2 font-medium">Sujet</th>
                <th className="px-4 py-2 font-medium">Statut</th>
                <th className="px-4 py-2 font-medium">Difficulté</th>
                <th className="px-4 py-2 font-medium">Signalements</th>
                <th className="px-4 py-2 font-medium">Mise à jour</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.data?.content.map((question) => (
                <CatalogueRow
                  key={question.questionId}
                  question={question}
                  onOpen={() => void navigate(`/questions/${question.questionId}`)}
                />
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={list.data?.page ?? 0}
          totalPages={list.data?.totalPages ?? 0}
          onPage={setPage}
        />
      </DataState>

      <CreateQuestionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(questionId) => {
          setCreateOpen(false)
          void navigate(`/questions/${questionId}`)
        }}
      />
    </div>
  )
}

function CatalogueRow({
  question,
  onOpen,
}: {
  question: AdminQuestionView
  onOpen: () => void
}) {
  const french = question.contents.find((content) => content.language === "fr")
  return (
    <tr>
      <td className="max-w-[420px] px-4 py-2">
        <div className="flex items-center gap-2">
          {question.imageUrl ? (
            <img
              src={question.imageUrl}
              alt=""
              className="size-9 rounded object-cover"
            />
          ) : (
            <span className="grid size-9 place-items-center rounded bg-muted text-xs">
              —
            </span>
          )}
          <span className="truncate">{french?.text ?? "—"}</span>
        </div>
      </td>
      <td className="px-4 py-2 text-muted-foreground">
        {question.topic.names.fr ?? question.topic.topicId}
      </td>
      <td className="px-4 py-2">
        <div className="flex flex-wrap gap-1">
          <StatusBadge status={question.status} />
          {question.suspended && <Badge variant="destructive">Suspendue</Badge>}
          {question.archived && <Badge variant="secondary">Archivée</Badge>}
        </div>
      </td>
      <td className="px-4 py-2 text-muted-foreground">
        {question.difficulty ?? "—"}
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        {question.totalReportCount === 0 ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <Badge variant="outline">
            {question.openReportCount} ouvert(s) / {question.totalReportCount}
          </Badge>
        )}
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
        {formatDateTime(question.updatedAt)}
      </td>
      <td className="px-4 py-2 text-right">
        <Button size="sm" variant="outline" onClick={onOpen}>
          Ouvrir
        </Button>
      </td>
    </tr>
  )
}

function TopicSelect({
  value,
  topics,
  onChange,
}: {
  value: string
  topics: { topicId: string; names: Partial<Record<"fr" | "en", string>> }[]
  onChange: (value: string) => void
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next ?? ALL)}>
      <SelectTrigger className="w-[210px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>Tous les sujets</SelectItem>
        {topics.map((topic) => (
          <SelectItem key={topic.topicId} value={topic.topicId}>
            {topic.names.fr ?? topic.names.en ?? topic.topicId}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function StatusBadge({ status }: { status: QuestionStatus }) {
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

function DataState<T>({
  query,
  emptyTitle,
  emptyDescription,
  children,
}: {
  query: {
    isPending: boolean
    error: unknown
    data?: T
    refetch: () => unknown
  }
  emptyTitle: string
  emptyDescription?: string
  children: React.ReactNode
}) {
  if (query.isPending) return <LoadingState />
  if (query.error) {
    return (
      <ErrorState error={query.error} onRetry={() => void query.refetch()} />
    )
  }
  const content = query.data as { content?: unknown[] } | undefined
  if (!content?.content?.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }
  return <>{children}</>
}

function CreateQuestionModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (questionId: string) => void
}) {
  const topics = useQuestionTopics()
  const [topicId, setTopicId] = useState("")
  const [text, setText] = useState("")
  const [answers, setAnswers] = useState<Record<QuestionChoice, string>>({
    A: "",
    B: "",
    C: "",
    D: "",
  })
  const [correctAnswer, setCorrectAnswer] = useState<QuestionChoice>("A")
  const [imageUrl, setImageUrl] = useState("")
  const create = useCreateQuestion(topicId || null)

  const submit = () => {
    create.mutate(
      {
        contents: [
          {
            language: "fr",
            text,
            answers: (["A", "B", "C", "D"] as QuestionChoice[]).map(
              (choice) => ({ choice, text: answers[choice] }),
            ),
          },
        ],
        correctAnswer,
        imageUrl: imageUrl.trim() || null,
      },
      {
        onSuccess: (result) => {
          setTopicId("")
          setText("")
          setAnswers({ A: "", B: "", C: "", D: "" })
          setCorrectAnswer("A")
          setImageUrl("")
          onCreated(result.questionId)
        },
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouvelle question"
      description="Choisis le sujet, saisis le contenu français puis la bonne réponse."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={submit}
            disabled={
              !topicId ||
              !text.trim() ||
              Object.values(answers).some((answer) => !answer.trim()) ||
              create.isPending
            }
          >
            Créer
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <label className="block text-xs text-muted-foreground">
          Sujet
          <Select value={topicId} onValueChange={(value) => setTopicId(value ?? "")}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Choisir un sujet…" />
            </SelectTrigger>
            <SelectContent>
              {(topics.data ?? []).map((topic) => (
                <SelectItem key={topic.topicId} value={topic.topicId}>
                  {topic.names.fr ?? topic.names.en ?? topic.topicId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="block text-xs text-muted-foreground">
          Énoncé (FR)
          <Textarea
            className="mt-1"
            value={text}
            maxLength={255}
            onChange={(event) => setText(event.target.value)}
          />
        </label>
        {(["A", "B", "C", "D"] as QuestionChoice[]).map((choice) => (
          <label
            key={choice}
            className="block text-xs text-muted-foreground"
          >
            Réponse {choice}
            <Input
              className="mt-1"
              value={answers[choice]}
              onChange={(event) =>
                setAnswers((current) => ({
                  ...current,
                  [choice]: event.target.value,
                }))
              }
            />
          </label>
        ))}
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
          Image (URL, optionnel)
          <Input
            className="mt-1"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://…"
          />
        </label>
      </div>
    </Modal>
  )
}
