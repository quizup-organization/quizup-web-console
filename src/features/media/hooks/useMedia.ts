import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import { mediaService, type MediaOrigin } from "../lib/media"

/** Objets du bucket, pagination par curseur S3 (accumulation « charger plus »). */
export function useMediaObjects(origin?: MediaOrigin, q?: string, size = 50) {
  return useInfiniteQuery({
    queryKey: queryKeys.media.objects(origin ?? "all", q ?? ""),
    queryFn: ({ pageParam }) =>
      mediaService.objects({ origin, q: q || undefined, cursor: pageParam, size }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}

/** Statistiques bucket/catalogue — scan S3 complet côté BFF : pas de polling. */
export function useMediaStats() {
  return useQuery({
    queryKey: queryKeys.media.stats(),
    queryFn: () => mediaService.stats(),
    staleTime: 30_000,
  })
}

export function useMediaOrphans() {
  return useQuery({
    queryKey: queryKeys.media.orphans(),
    queryFn: () => mediaService.orphans(),
    staleTime: 30_000,
  })
}

export function useMediaUsage(page: number, size = 50) {
  return useQuery({
    queryKey: queryKeys.media.usage(page, size),
    queryFn: () => mediaService.usage(page, size),
    placeholderData: keepPreviousData,
  })
}
