import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/lib/query-keys"
import {
  userModerationService,
  type ResolveUserReportsInput,
  type SuspendUserInput,
  type UserCatalogueParams,
  type UserReportQueueParams,
} from "../lib/user-moderation"

export function useUserModerationSummary() {
  return useQuery({
    queryKey: queryKeys.userModeration.summary(),
    queryFn: () => userModerationService.summary(),
    refetchInterval: 60_000,
  })
}

export function useUserCatalogue(params: UserCatalogueParams) {
  return useQuery({
    queryKey: queryKeys.userModeration.catalogue(params),
    queryFn: () => userModerationService.catalogue(params),
  })
}

export function useReportedUserQueue(params: UserReportQueueParams) {
  return useQuery({
    queryKey: queryKeys.userModeration.queue(params),
    queryFn: () => userModerationService.queue(params),
  })
}

export function useUserModerationDetail(userId: string) {
  return useQuery({
    queryKey: queryKeys.userModeration.detail(userId),
    queryFn: () => userModerationService.detail(userId),
    enabled: Boolean(userId),
    refetchInterval: 30_000,
  })
}

export function useUserModerationSearch(query: string) {
  const trimmed = query.trim()
  return useQuery({
    queryKey: queryKeys.userModeration.search(trimmed),
    queryFn: () => userModerationService.search(trimmed, 10),
    enabled: trimmed.length >= 2,
    staleTime: 15_000,
  })
}

function useInvalidateUserModeration() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.userModeration.all,
    })
  }
}

export function useSuspendUser(userId: string) {
  const invalidate = useInvalidateUserModeration()
  return useMutation({
    mutationFn: (input: SuspendUserInput) =>
      userModerationService.suspend(userId, input),
    onSuccess: (result) => {
      toast.success(
        result.suspendedUntil
          ? "Compte suspendu jusqu'à l'échéance"
          : "Compte suspendu définitivement",
      )
      invalidate()
    },
  })
}

export function useReinstateUser(userId: string) {
  const invalidate = useInvalidateUserModeration()
  return useMutation({
    mutationFn: (note?: string) => userModerationService.reinstate(userId, note),
    onSuccess: () => {
      toast.success("Compte réactivé")
      invalidate()
    },
  })
}

export function useResolveUserReports(userId: string) {
  const invalidate = useInvalidateUserModeration()
  return useMutation({
    mutationFn: ({
      reportId,
      input,
    }: {
      reportId?: string
      input: ResolveUserReportsInput
    }) =>
      reportId
        ? userModerationService.resolveReport(reportId, input)
        : userModerationService.resolveReports(userId, input),
    onSuccess: () => {
      toast.success("Signalements clôturés")
      invalidate()
    },
  })
}
