import { bffApi } from "@/lib/bff-api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { Page } from "@/shared/types/api"

export type QuestionStatus = "PENDING" | "APPROVED" | "REJECTED"
export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT"
export type QuestionChoice = "A" | "B" | "C" | "D"
export type QuestionReportReason = "QUESTION" | "IMAGE" | "ANSWERS"
export type QuestionReportStatus = "OPEN" | "RESOLVED" | "DISMISSED"
export type QuestionReportResolution = "RESOLVED" | "DISMISSED"
export type QuestionSuspensionReason = "AUTO_REPORT_THRESHOLD" | "MANUAL"
export type QuestionModeration = "ALL" | "ACTIVE" | "SUSPENDED" | "ARCHIVED"
export type QuestionAdminSort = "RECENT_UPDATED" | "OLDEST_UPDATED"
export type QuestionReportSort =
  | "RECENT_REPORT"
  | "OLDEST_REPORT"
  | "MOST_REPORTED"
export type Language = "fr" | "en"

export interface TopicRef {
  topicId: string
  names: Partial<Record<Language, string>>
}

export interface AnswerView {
  choice: QuestionChoice
  text: string
}

export interface ContentView {
  language: Language
  text: string
  answers: AnswerView[]
}

export interface SnapshotView {
  questionText: string
  imageUrl: string | null
  answers: { choice: string; text: string }[]
  translations: {
    language: Language
    text: string
    answers: { choice: string; text: string }[]
  }[]
  correctAnswer: string | null
  language: string | null
  source: "PLAYED" | "CURRENT" | null
}

export interface AdminQuestionView {
  questionId: string
  topic: TopicRef
  contents: ContentView[]
  correctAnswer: QuestionChoice
  imageUrl: string | null
  status: QuestionStatus
  difficulty: QuestionDifficulty | null
  suspended: boolean
  suspensionReason: QuestionSuspensionReason | null
  suspensionNote: string | null
  suspendedAt: string | null
  suspendedBy: string | null
  reinstatedAt: string | null
  archived: boolean
  archiveNote: string | null
  archivedAt: string | null
  archivedBy: string | null
  restoredAt: string | null
  createdAt: string
  updatedAt: string | null
  openReportCount: number
  totalReportCount: number
  lastReportedAt: string | null
}

export interface AdminQuestionSummaryView {
  questionId: string
  topic: TopicRef
  texts: Partial<Record<Language, string>>
  imageUrl: string | null
  status: QuestionStatus
  difficulty: QuestionDifficulty | null
  suspended: boolean
  archived: boolean
  openReportCount: number
  totalReportCount: number
  lastReportedAt: string | null
}

export interface AdminQuestionReportView {
  reportId: string
  reporterId: string
  reporterPseudonym: string | null
  reasons: QuestionReportReason[]
  comment: string | null
  language: Language | null
  snapshot: SnapshotView | null
  status: QuestionReportStatus
  createdAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  resolutionNote: string | null
}

export interface AdminQuestionDetailView {
  question: AdminQuestionView
  reports: AdminQuestionReportView[]
}

export interface AdminTopicOptionView {
  topicId: string
  names: Partial<Record<Language, string>>
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  questionsCount: number
}

export interface QuestionReportSummaryView {
  openReports: number
  reportedQuestions: number
  suspendedQuestions: number
  archivedQuestions: number
}

export interface QuestionListParams {
  q?: string
  topicId?: string
  status?: QuestionStatus
  difficulty?: QuestionDifficulty
  moderation?: QuestionModeration
  reportedOnly?: boolean
  sort?: QuestionAdminSort
  page?: number
  size?: number
}

export interface QuestionQueueParams {
  status?: QuestionReportStatus
  topicId?: string
  suspended?: boolean
  sort?: QuestionReportSort
  page?: number
  size?: number
}

export interface ResolveQuestionReportsInput {
  resolution: QuestionReportResolution
  note?: string
}

export interface CreateQuestionInput {
  contents: {
    language: Language
    text: string
    answers: { choice: QuestionChoice; text: string }[]
  }[]
  correctAnswer: QuestionChoice
  imageUrl?: string | null
}

export interface QuestionModerationInput {
  note?: string
  resolveOpenReports?: boolean
}

export const questionsService = {
  list: (params: QuestionListParams): Promise<Page<AdminQuestionView>> =>
    bffApi.get<Page<AdminQuestionView>>(ENDPOINTS.bff.questions.list, {
      params: { ...params, reportedOnly: params.reportedOnly || undefined },
    }),
  queue: (params: QuestionQueueParams): Promise<Page<AdminQuestionSummaryView>> =>
    bffApi.get<Page<AdminQuestionSummaryView>>(ENDPOINTS.bff.questions.reports, {
      params: { ...params } as Record<
        string,
        string | number | boolean | undefined
      >,
    }),
  summary: (): Promise<QuestionReportSummaryView> =>
    bffApi.get<QuestionReportSummaryView>(
      ENDPOINTS.bff.questions.reportSummary,
    ),
  topics: (): Promise<AdminTopicOptionView[]> =>
    bffApi.get<AdminTopicOptionView[]>(ENDPOINTS.bff.questions.topics),
  detail: (questionId: string): Promise<AdminQuestionDetailView> =>
    bffApi.get<AdminQuestionDetailView>(
      ENDPOINTS.bff.questions.detail(questionId),
    ),
  create: (topicId: string, input: CreateQuestionInput): Promise<{ questionId: string }> =>
    bffApi.post<{ questionId: string }>(
      ENDPOINTS.bff.questions.create(topicId),
      input,
    ),
  updateText: (questionId: string, language: Language, text: string): Promise<void> =>
    bffApi.put<void>(ENDPOINTS.bff.questions.text(questionId), {
      language,
      text,
    }),
  updateAnswers: (
    questionId: string,
    language: Language,
    answers: { choice: QuestionChoice; text: string }[],
  ): Promise<void> =>
    bffApi.put<void>(ENDPOINTS.bff.questions.answers(questionId), {
      language,
      answers,
    }),
  updateCorrectAnswer: (
    questionId: string,
    correctAnswer: QuestionChoice,
  ): Promise<void> =>
    bffApi.put<void>(ENDPOINTS.bff.questions.correctAnswer(questionId), {
      correctAnswer,
    }),
  updateImageUrl: (
    questionId: string,
    imageUrl: string | null,
  ): Promise<void> =>
    bffApi.put<void>(ENDPOINTS.bff.questions.imageUrl(questionId), {
      imageUrl,
    }),
  addTranslation: (
    questionId: string,
    input: {
      language: Language
      text: string
      answers: { choice: QuestionChoice; text: string }[]
    },
  ): Promise<void> =>
    bffApi.post<void>(ENDPOINTS.bff.questions.translations(questionId), input),
  approve: (questionId: string): Promise<void> =>
    bffApi.post<void>(ENDPOINTS.bff.questions.approve(questionId)),
  reject: (questionId: string, reason?: string): Promise<void> =>
    bffApi.post<void>(ENDPOINTS.bff.questions.reject(questionId), {
      reason: reason ?? null,
    }),
  suspend: (questionId: string, input: QuestionModerationInput): Promise<void> =>
    bffApi.post<void>(ENDPOINTS.bff.questions.suspend(questionId), input),
  reinstate: (questionId: string, input: QuestionModerationInput): Promise<void> =>
    bffApi.post<void>(ENDPOINTS.bff.questions.reinstate(questionId), input),
  archive: (questionId: string, input: QuestionModerationInput): Promise<void> =>
    bffApi.post<void>(ENDPOINTS.bff.questions.archive(questionId), input),
  restore: (questionId: string): Promise<void> =>
    bffApi.post<void>(ENDPOINTS.bff.questions.restore(questionId)),
  resolveReport: (
    reportId: string,
    input: ResolveQuestionReportsInput,
  ): Promise<{ resolvedCount: number }> =>
    bffApi.post<{ resolvedCount: number }>(
      ENDPOINTS.bff.questions.resolveReport(reportId),
      input,
    ),
  resolveReports: (
    questionId: string,
    input: ResolveQuestionReportsInput,
  ): Promise<{ resolvedCount: number }> =>
    bffApi.post<{ resolvedCount: number }>(
      ENDPOINTS.bff.questions.resolveReports(questionId),
      input,
    ),
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const form = new FormData()
    form.append("file", file)
    return bffApi.postForm<{ url: string }>("/api/media", form)
  },
}
