import { bffApi } from "@/lib/bff-api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { Page } from "@/shared/types/api"

export type AccountStatus = "ACTIVE" | "SUSPENDED"

export type UserReportReason =
  | "HARASSMENT"
  | "HATE_SPEECH"
  | "INAPPROPRIATE_CONTENT"
  | "CHEATING"
  | "SPAM"
  | "OTHER"

export type UserSuspensionReason =
  | UserReportReason
  | "THREATS"
  | "IMPERSONATION"
  | "PRIVACY_VIOLATION"
  | "COPYRIGHT"
  | "EXPLOIT_ABUSE"
  | "MULTIPLE_ACCOUNTS"
  | "TERMS_VIOLATION"
  | "MINOR_SAFETY"
  | "FRAUD"

export type UserReportStatus = "OPEN" | "RESOLVED" | "DISMISSED"
export type UserReportResolution = "RESOLVED" | "DISMISSED"
export type UserReportContext = "PROFILE" | "GAME"
export type UserReportSort =
  | "RECENT_REPORT"
  | "OLDEST_REPORT"
  | "MOST_REPORTED"

export interface UserReportSnapshotView {
  pseudonym: string | null
  avatarOptions: string | null
}

export interface AdminUserReportView {
  reportId: string
  reporterId: string
  reporterPseudonym: string | null
  reasons: UserReportReason[]
  comment: string | null
  context: UserReportContext
  gameId: string | null
  snapshot: UserReportSnapshotView | null
  status: UserReportStatus
  createdAt: string
  reviewedBy: string | null
  reviewedAt: string | null
  resolutionNote: string | null
}

export interface AdminReportedUserSummaryView {
  userId: string
  email: string | null
  pseudonym: string | null
  avatarOptions: string | null
  suspended: boolean
  suspendedUntil: string | null
  openReportCount: number
  totalReportCount: number
  lastReportedAt: string | null
}

export interface AdminUserAccountView {
  userId: string
  email: string
  createdAt: string
  status: AccountStatus
  suspended: boolean
  suspendedUntil: string | null
  suspensionReason: UserSuspensionReason | null
  suspensionNote: string | null
  suspendedAt: string | null
  suspendedBy: string | null
  reinstatedAt: string | null
  reinstatedBy: string | null
  reinstatementReason: string | null
  reinstatementNote: string | null
  protectedAccount: boolean
}

export interface AdminUserProfileView {
  pseudonym: string | null
  bio: string | null
  country: string | null
  avatarOptions: string | null
  bannerUrl: string | null
}

export interface AdminUserDetailView {
  account: AdminUserAccountView
  profile: AdminUserProfileView | null
  reports: AdminUserReportView[]
}

export interface AdminUserSearchResultView {
  userId: string
  email: string
  pseudonym: string | null
  avatarOptions: string | null
  status: AccountStatus
  suspended: boolean
  suspendedUntil: string | null
  protectedAccount: boolean
}

export interface AdminUserCatalogueView {
  userId: string
  email: string
  pseudonym: string | null
  avatarOptions: string | null
  status: AccountStatus
  suspended: boolean
  suspendedUntil: string | null
  createdAt: string
  protectedAccount: boolean
  openReportCount: number
  totalReportCount: number
  lastReportedAt: string | null
}

export interface AdminUserModerationSummaryView {
  openReports: number
  reportedUsers: number
  suspendedUsers: number
}

export interface AdminUserModerationView {
  userId: string
  status: AccountStatus
  suspendedUntil: string | null
  suspensionReason: UserSuspensionReason | null
  resolvedReports: number
  protectedAccount: boolean
}

export interface UserReportQueueParams {
  status?: UserReportStatus
  suspended?: boolean
  sort?: UserReportSort
  page?: number
  size?: number
}

export interface UserCatalogueParams {
  q?: string
  status?: AccountStatus
  reportedOnly?: boolean
  page?: number
  size?: number
}

export interface ResolveUserReportsInput {
  resolution: UserReportResolution
  note?: string
}

export interface SuspendUserInput {
  reason: UserSuspensionReason
  note?: string
  duration?: string
  permanent: boolean
  resolveOpenReports: boolean
}

export const USER_REPORT_REASON_LABELS: Record<UserReportReason, string> = {
  HARASSMENT: "Harcèlement",
  HATE_SPEECH: "Discours haineux",
  INAPPROPRIATE_CONTENT: "Contenu inapproprié",
  CHEATING: "Triche",
  SPAM: "Spam",
  OTHER: "Autre",
}

export const USER_SUSPENSION_REASON_LABELS: Record<
  UserSuspensionReason,
  string
> = {
  ...USER_REPORT_REASON_LABELS,
  THREATS: "Menaces ou violence",
  IMPERSONATION: "Usurpation d'identité",
  PRIVACY_VIOLATION: "Atteinte à la vie privée",
  COPYRIGHT: "Atteinte au droit d'auteur",
  EXPLOIT_ABUSE: "Exploitation de faille",
  MULTIPLE_ACCOUNTS: "Comptes multiples / contournement",
  TERMS_VIOLATION: "Violation des conditions d'utilisation",
  MINOR_SAFETY: "Mise en danger de mineurs",
  FRAUD: "Fraude ou arnaque",
}

export const userModerationService = {
  catalogue: (
    params: UserCatalogueParams,
  ): Promise<Page<AdminUserCatalogueView>> =>
    bffApi.get<Page<AdminUserCatalogueView>>(
      ENDPOINTS.bff.userModeration.catalogue,
      {
        params: { ...params } as Record<
          string,
          string | number | boolean | undefined
        >,
      },
    ),
  queue: (
    params: UserReportQueueParams,
  ): Promise<Page<AdminReportedUserSummaryView>> =>
    bffApi.get<Page<AdminReportedUserSummaryView>>(
      ENDPOINTS.bff.userModeration.queue,
      {
        params: { ...params } as Record<
          string,
          string | number | boolean | undefined
        >,
      },
    ),
  summary: (): Promise<AdminUserModerationSummaryView> =>
    bffApi.get<AdminUserModerationSummaryView>(
      ENDPOINTS.bff.userModeration.summary,
    ),
  search: (
    q: string,
    limit = 10,
  ): Promise<AdminUserSearchResultView[]> =>
    bffApi.get<AdminUserSearchResultView[]>(
      ENDPOINTS.bff.userModeration.search,
      { params: { q, limit } },
    ),
  detail: (userId: string): Promise<AdminUserDetailView> =>
    bffApi.get<AdminUserDetailView>(
      ENDPOINTS.bff.userModeration.detail(userId),
    ),
  suspend: (
    userId: string,
    input: SuspendUserInput,
  ): Promise<AdminUserModerationView> =>
    bffApi.post<AdminUserModerationView>(
      ENDPOINTS.bff.userModeration.suspend(userId),
      input,
    ),
  reinstate: (
    userId: string,
    note?: string,
  ): Promise<AdminUserModerationView> =>
    bffApi.post<AdminUserModerationView>(
      ENDPOINTS.bff.userModeration.reinstate(userId),
      { note: note || null },
    ),
  resolveReport: (
    reportId: string,
    input: ResolveUserReportsInput,
  ): Promise<{ resolvedCount: number }> =>
    bffApi.post<{ resolvedCount: number }>(
      ENDPOINTS.bff.userModeration.resolveReport(reportId),
      input,
    ),
  resolveReports: (
    userId: string,
    input: ResolveUserReportsInput,
  ): Promise<{ resolvedCount: number }> =>
    bffApi.post<{ resolvedCount: number }>(
      ENDPOINTS.bff.userModeration.resolveReports(userId),
      input,
    ),
}
