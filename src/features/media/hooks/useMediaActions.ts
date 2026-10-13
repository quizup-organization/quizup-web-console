import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/lib/query-keys"
import type { ApiError } from "@/shared/types/api"
import { mediaActionsService } from "../lib/media"

/** Actions d'administration média — invalide tout le namespace média après succès. */
export function useMediaActions() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.media.all })
  }
  const onError = (error: ApiError) => toast.error(error.message)

  return {
    deleteObject: useMutation({
      mutationFn: ({ key, force }: { key: string; force: boolean }) =>
        mediaActionsService.deleteObject(key, force),
      onSuccess: (result) => {
        toast.success(
          `${result.deletedObjects} objet(s) et ${result.deletedAssets} référence(s) supprimés`,
        )
        invalidate()
      },
      onError,
    }),
    deleteAsset: useMutation({
      mutationFn: (mediaId: string) => mediaActionsService.deleteAsset(mediaId),
      onSuccess: () => {
        toast.success("Ligne média supprimée")
        invalidate()
      },
      onError,
    }),
    purgeOrphans: useMutation({
      mutationFn: () => mediaActionsService.purgeOrphans(),
      onSuccess: (result) => {
        const skipped =
          result.skippedReferenced > 0
            ? ` — ${result.skippedReferenced} objet(s) référencé(s) conservé(s)`
            : ""
        toast.success(
          `${result.deletedObjects} objet(s) et ${result.deletedAssets} ligne(s) purgés${skipped}`,
        )
        invalidate()
      },
      onError,
    }),
  }
}
