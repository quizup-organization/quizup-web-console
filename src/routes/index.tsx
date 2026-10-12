import { Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { AdminGate } from "@/features/auth"
import {
  CallbackPage,
  LoginPage,
  SilentCallbackPage,
} from "@/features/auth/pages"
import { ApplicationsPage } from "@/features/applications/pages"
import { AuditPage } from "@/features/audit/pages"
import { DlqPage, DlqProcessorPage } from "@/features/dlq/pages"
import {
  ProcessorDetailPage,
  ProcessorsPage,
} from "@/features/processors/pages"
import { AppShell } from "@/features/shell"
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
            <Route index element={<Navigate to="/applications" replace />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="processors" element={<ProcessorsPage />} />
            <Route
              path="processors/:application/:instanceId/:name"
              element={<ProcessorDetailPage />}
            />
            <Route path="dlq" element={<DlqPage />} />
            <Route
              path="dlq/:application/:instanceId/:processor"
              element={<DlqProcessorPage />}
            />
            <Route path="audit" element={<AuditPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/applications" replace />} />
      </Routes>
    </Suspense>
  )
}
