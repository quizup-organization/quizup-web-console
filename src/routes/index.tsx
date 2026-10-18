import { Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { AdminGate } from "@/features/auth"
import {
  CallbackPage,
  LoginPage,
  SilentCallbackPage,
} from "@/features/auth/pages"
import {
  ApplicationDetailPage,
  ApplicationsPage,
} from "@/features/applications/pages"
import { AuditPage } from "@/features/audit/pages"
import { DashboardPage } from "@/features/dashboard/pages"
import { DlqPage, DlqProcessorPage } from "@/features/dlq/pages"
import { MediaPage } from "@/features/media/pages"
import { CommandsPage, QueriesPage } from "@/features/messages/pages"
import {
  ProcessorDetailPage,
  ProcessorsPage,
} from "@/features/processors/pages"
import { QuestionDetailPage, QuestionsPage } from "@/features/questions/pages"
import {
  PlayersPage,
  UserModerationDetailPage,
} from "@/features/user-moderation/pages"
import { ScheduledEventsPage } from "@/features/scheduled/pages"
import { SearchPage } from "@/features/search/pages"
import { AppShell } from "@/features/shell"
import { UsersPage } from "@/features/users/pages"
import { FullScreenLoader } from "@/shared/components/FullScreenLoader"

export function AppRoutes() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/silent-callback" element={<SilentCallbackPage />} />

        <Route element={<AdminGate />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route
              path="applications/:application"
              element={<ApplicationDetailPage />}
            />
            <Route path="processors" element={<ProcessorsPage />} />
            <Route
              path="processors/:application/:instanceId/:name"
              element={<ProcessorDetailPage />}
            />
            <Route path="commands" element={<CommandsPage />} />
            <Route path="queries" element={<QueriesPage />} />
            <Route path="scheduled-events" element={<ScheduledEventsPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="dlq" element={<DlqPage />} />
            <Route
              path="dlq/:application/:instanceId/:processor"
              element={<DlqProcessorPage />}
            />
            <Route path="users" element={<UsersPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="questions" element={<QuestionsPage />} />
            <Route path="questions/:questionId" element={<QuestionDetailPage />} />
            <Route path="user-reports" element={<PlayersPage />} />
            <Route
              path="user-reports/:userId"
              element={<UserModerationDetailPage />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
