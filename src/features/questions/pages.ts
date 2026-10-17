import { lazy } from "react"

export const QuestionsPage = lazy(() =>
  import("./pages/QuestionsPage").then((module) => ({
    default: module.QuestionsPage,
  })),
)

export const QuestionDetailPage = lazy(() =>
  import("./pages/QuestionDetailPage").then((module) => ({
    default: module.QuestionDetailPage,
  })),
)
