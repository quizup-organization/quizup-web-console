import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"
import {
  questionsService,
  type CreateQuestionInput,
  type QuestionListParams,
  type QuestionModerationInput,
  type QuestionQueueParams,
  type ResolveQuestionReportsInput,
} from "../lib/questions"

export function useQuestionSummary() {
  return useQuery({
    queryKey: queryKeys.questions.summary(),
    queryFn: () => questionsService.summary(),
    refetchInterval: 60_000,
  })
}

export function useQuestionQueue(params: QuestionQueueParams) {
  return useQuery({
    queryKey: queryKeys.questions.queue(params),
    queryFn: () => questionsService.queue(params),
  })
}

export function useQuestionList(params: QuestionListParams) {
  return useQuery({
    queryKey: queryKeys.questions.list(params),
    queryFn: () => questionsService.list(params),
  })
}

export function useQuestionTopics() {
  return useQuery({
    queryKey: queryKeys.questions.topics(),
    queryFn: () => questionsService.topics(),
    staleTime: 60_000,
  })
}

export function useQuestionDetail(questionId: string) {
  return useQuery({
    queryKey: queryKeys.questions.detail(questionId),
    queryFn: () => questionsService.detail(questionId),
    enabled: Boolean(questionId),
    refetchInterval: 30_000,
  })
}

function useInvalidateQuestions() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.questions.all })
  }
}

export function useCreateQuestion(topicId: string | null) {
  const invalidate = useInvalidateQuestions()
  return useMutation({
    mutationFn: (input: CreateQuestionInput) => {
      if (!topicId) throw new Error("Choisis un sujet")
      return questionsService.create(topicId, input)
    },
    onSuccess: () => {
      toast.success("Question créée")
      invalidate()
    },
  })
}

export function useSaveQuestion(questionId: string) {
  const invalidate = useInvalidateQuestions()
  return useMutation({
    mutationFn: async (input: CreateQuestionInput) => {
      for (const content of input.contents) {
        await questionsService.updateText(
          questionId,
          content.language,
          content.text,
        )
        await questionsService.updateAnswers(
          questionId,
          content.language,
          content.answers,
        )
      }
      await questionsService.updateCorrectAnswer(
        questionId,
        input.correctAnswer,
      )
      await questionsService.updateImageUrl(questionId, input.imageUrl ?? null)
    },
    onSuccess: () => {
      toast.success("Question mise à jour")
      invalidate()
    },
  })
}

export type QuestionModerationAction =
  | "approve"
  | "reject"
  | "suspend"
  | "reinstate"
  | "archive"
  | "restore"

export function useQuestionModeration(questionId: string) {
  const invalidate = useInvalidateQuestions()
  return useMutation({
    mutationFn: async ({
      action,
      input,
    }: {
      action: QuestionModerationAction
      input?: QuestionModerationInput
    }) => {
      switch (action) {
        case "approve":
          return questionsService.approve(questionId)
        case "reject":
          return questionsService.reject(questionId)
        case "suspend":
          return questionsService.suspend(questionId, input ?? {})
        case "reinstate":
          return questionsService.reinstate(questionId, input ?? {})
        case "archive":
          return questionsService.archive(questionId, input ?? {})
        case "restore":
          return questionsService.restore(questionId)
      }
    },
    onSuccess: (_result, variables) => {
      toast.success(actionLabel(variables.action))
      invalidate()
    },
  })
}

export function useResolveQuestionReports(questionId: string) {
  const invalidate = useInvalidateQuestions()
  return useMutation({
    mutationFn: ({
      reportId,
      input,
    }: {
      reportId?: string
      input: ResolveQuestionReportsInput
    }) =>
      reportId
        ? questionsService.resolveReport(reportId, input)
        : questionsService.resolveReports(questionId, input),
    onSuccess: () => {
      toast.success("Signalements clôturés")
      invalidate()
    },
  })
}

export function useUploadQuestionImage() {
  return useMutation({
    mutationFn: (file: File) => questionsService.uploadImage(file),
    onSuccess: () => toast.success("Image téléversée"),
  })
}

function actionLabel(action: QuestionModerationAction): string {
  switch (action) {
    case "approve":
      return "Question approuvée"
    case "reject":
      return "Question rejetée"
    case "suspend":
      return "Question suspendue"
    case "reinstate":
      return "Question réactivée"
    case "archive":
      return "Question archivée"
    case "restore":
      return "Question restaurée"
  }
}
