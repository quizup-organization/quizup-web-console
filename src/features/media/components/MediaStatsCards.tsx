import { formatBytes } from "@/lib/format"
import { ErrorState, LoadingState } from "@/shared/components/DataState"
import { StatCard } from "@/shared/components/StatCard"
import { useMediaStats } from "../hooks/useMedia"

/** Cartes de synthèse du bucket : volumes par origine, catalogue, orphelins. */
export function MediaStatsCards() {
  const { data, isPending, error, refetch } = useMediaStats()

  if (isPending) {
    return <LoadingState rows={1} />
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  const upload = data.buckets.find((bucket) => bucket.origin === "UPLOAD")
  const seed = data.buckets.find((bucket) => bucket.origin === "SEED")
  const totalObjects = data.buckets.reduce((sum, bucket) => sum + bucket.count, 0)
  const totalBytes = data.buckets.reduce((sum, bucket) => sum + bucket.bytes, 0)

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Objets stockés"
        value={totalObjects.toLocaleString("fr-FR")}
        hint={`uploads : ${upload?.count ?? 0} · seed : ${seed?.count ?? 0} · ${formatBytes(totalBytes)}${data.truncated ? " · scan tronqué" : ""}`}
      />
      <StatCard
        label="Catalogue média"
        value={data.assets.count.toLocaleString("fr-FR")}
        hint={`${formatBytes(data.assets.bytes)} · ${data.assets.owners} joueur(s)`}
      />
      <StatCard
        label="Objets orphelins"
        value={data.orphanObjectCount.toLocaleString("fr-FR")}
        hint={`${formatBytes(data.orphanObjectBytes)} sans ligne media_asset`}
        tone={data.orphanObjectCount > 0 ? "warning" : "default"}
      />
      <StatCard
        label="Références fantômes"
        value={data.danglingAssetCount.toLocaleString("fr-FR")}
        hint="lignes media_asset sans objet S3"
        tone={data.danglingAssetCount > 0 ? "danger" : "default"}
      />
    </div>
  )
}
