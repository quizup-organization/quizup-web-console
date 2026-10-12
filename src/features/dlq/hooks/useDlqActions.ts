import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/lib/query-keys"
import type { ApiError } from "@/shared/types/api"
import { dlqActionsService } from "../lib/dlq"

/** Actions DLQ (retry/delete de séquence, purge) — invalide l'état DLQ après succès. */
export function useDlqActions(
  application: string,
  instanceId: string,
  processor: string,
) {
  const queryClient = useQueryClient()

  const onSuccess = (message: string) => {
    toast.success(message)
    void queryClient.invalidateQueries({ queryKey: queryKeys.dlq.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.processors.all })
  }
  const onError = (error: ApiError) => toast.error(error.message)

  return {
    retry: useMutation({
      mutationFn: (sequenceId: string) =>
        dlqActionsService.retrySequence(application, instanceId, processor, sequenceId),
      onSuccess: (result) =>
        result.processed
          ? onSuccess("Séquence relancée")
          : toast.warning("Séquence non traitée (déjà en cours ?)"),
      onError,
    }),
    remove: useMutation({
      mutationFn: (sequenceId: string) =>
        dlqActionsService.deleteSequence(application, instanceId, processor, sequenceId),
      onSuccess: (result) => onSuccess(`${result.deleted} message(s) supprimé(s)`),
      onError,
    }),
    clear: useMutation({
      mutationFn: () => dlqActionsService.clear(application, instanceId, processor),
      onSuccess: () => onSuccess("Dead-letter queue vidée"),
      onError,
    }),
  }
}
