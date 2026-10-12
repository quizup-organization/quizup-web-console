import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { api } from "@/lib/api"
import { ENDPOINTS } from "@/lib/endpoints"
import { queryKeys } from "@/lib/query-keys"
import type { ApiError } from "@/shared/types/api"
import {
  processorActionsService,
  type ResetPayload,
} from "../lib/processors"

/** Actions de cycle de vie d'un processor : invalide l'état processors + DLQ après succès. */
export function useProcessorActions(
  application: string,
  instanceId: string,
  name: string,
) {
  const queryClient = useQueryClient()

  const onSuccess = (message: string) => {
    toast.success(message)
    void queryClient.invalidateQueries({ queryKey: queryKeys.processors.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.dlq.all })
  }
  const onError = (error: ApiError) => toast.error(error.message)

  return {
    pause: useMutation({
      mutationFn: () => processorActionsService.pause(application, instanceId, name),
      onSuccess: () => onSuccess("Processor mis en pause"),
      onError,
    }),
    start: useMutation({
      mutationFn: () => processorActionsService.start(application, instanceId, name),
      onSuccess: () => onSuccess("Processor démarré"),
      onError,
    }),
    pauseAll: useMutation({
      mutationFn: () =>
        api.post<{ instances: number; succeeded: number; failures: string[] }>(
          ENDPOINTS.console.actions.pauseAllProcessor(application, name),
        ),
      onSuccess: (result) =>
        onSuccess(`${result.succeeded}/${result.instances} instance(s) en pause`),
      onError,
    }),
    startAll: useMutation({
      mutationFn: () =>
        api.post<{ instances: number; succeeded: number; failures: string[] }>(
          ENDPOINTS.console.actions.startAllProcessor(application, name),
        ),
      onSuccess: (result) =>
        onSuccess(`${result.succeeded}/${result.instances} instance(s) démarrée(s)`),
      onError,
    }),
    reset: useMutation({
      mutationFn: (payload: ResetPayload) =>
        processorActionsService.reset(application, instanceId, name, payload),
      onSuccess: () => onSuccess("Reset déclenché — le replay va démarrer"),
      onError,
    }),
    split: useMutation({
      mutationFn: (segmentId: number) =>
        processorActionsService.split(application, instanceId, name, segmentId),
      onSuccess: () => onSuccess("Split demandé"),
      onError,
    }),
    merge: useMutation({
      mutationFn: (segmentId: number) =>
        processorActionsService.merge(application, instanceId, name, segmentId),
      onSuccess: () => onSuccess("Merge demandé"),
      onError,
    }),
  }
}
