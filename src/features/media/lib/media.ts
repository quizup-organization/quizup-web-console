import { bffApi } from "@/lib/bff-api"
import { ENDPOINTS } from "@/lib/endpoints"

export type MediaOrigin = "UPLOAD" | "SEED" | "OTHER"

export interface MediaObjectView {
  key: string
  origin: MediaOrigin
  url: string
  sizeBytes: number
  lastModified: string | null
  assetCount: number
  uploaders: string[]
  referenceCount: number | null
}

export interface MediaObjectsPage {
  objects: MediaObjectView[]
  nextCursor: string | null
}

export interface MediaStatsView {
  buckets: { origin: string; count: number; bytes: number }[]
  assets: { count: number; bytes: number; owners: number }
  orphanObjectCount: number
  orphanObjectBytes: number
  danglingAssetCount: number
  truncated: boolean
}

export interface MediaAssetView {
  id: string
  objectKey: string
  url: string
  uploadedBy: string
  sizeBytes: number
  createdAt: string
}

export interface MediaOrphansView {
  objects: MediaObjectView[]
  assets: MediaAssetView[]
}

export interface MediaUsageView {
  uploadedBy: string
  assetCount: number
  bytes: number
}

export interface MediaUsagePage {
  content: MediaUsageView[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface MediaDeleteResult {
  deletedObjects: number
  deletedAssets: number
}

export interface MediaPurgeResult {
  deletedObjects: number
  deletedAssets: number
  skippedReferenced: number
}

export interface MediaObjectsQuery {
  origin?: MediaOrigin
  q?: string
  cursor?: string
  size?: number
}

export const mediaService = {
  objects: (query: MediaObjectsQuery): Promise<MediaObjectsPage> =>
    bffApi.get<MediaObjectsPage>(ENDPOINTS.bff.media.objects, {
      params: {
        origin: query.origin,
        q: query.q,
        cursor: query.cursor,
        size: query.size,
      },
    }),
  stats: (): Promise<MediaStatsView> =>
    bffApi.get<MediaStatsView>(ENDPOINTS.bff.media.stats),
  orphans: (): Promise<MediaOrphansView> =>
    bffApi.get<MediaOrphansView>(ENDPOINTS.bff.media.orphans),
  usage: (page: number, size = 50): Promise<MediaUsagePage> =>
    bffApi.get<MediaUsagePage>(ENDPOINTS.bff.media.usage, {
      params: { page, size },
    }),
}

export const mediaActionsService = {
  deleteObject: (key: string, force: boolean): Promise<MediaDeleteResult> =>
    bffApi.delete<MediaDeleteResult>(ENDPOINTS.bff.media.objects, {
      params: { key, force },
    }),
  deleteAsset: (mediaId: string): Promise<MediaDeleteResult> =>
    bffApi.delete<MediaDeleteResult>(ENDPOINTS.bff.media.asset(mediaId)),
  purgeOrphans: (): Promise<MediaPurgeResult> =>
    bffApi.post<MediaPurgeResult>(ENDPOINTS.bff.media.purgeOrphans),
}
