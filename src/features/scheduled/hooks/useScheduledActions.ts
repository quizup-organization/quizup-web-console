import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/lib/query-keys"
import type { ApiError } from "@/shared/types/api"
import { scheduledEventsService } from "../lib/scheduled"

/** Annulation d'une tâche planifiée (deadline) — auditée côté console. */
export function useCancelScheduledEvent(application: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (task: { taskName: string; taskInstance: string }) =>
      scheduledEventsService.cancel(application, task.taskName, task.taskInstance),
    onSuccess: () => {
      toast.success("Tâche planifiée annulée")
      void queryClient.invalidateQueries({
        queryKey: queryKeys.search.scheduledEvents(application),
      })
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}
