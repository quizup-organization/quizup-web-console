import { useState } from "react"
import { RefreshCw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatBytes, formatDateTime } from "@/lib/format"
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/DataState"
import { Modal } from "@/shared/components/Modal"
import { useMediaOrphans } from "../hooks/useMedia"
import { useMediaActions } from "../hooks/useMediaActions"
import type { MediaObjectView } from "../lib/media"
import { DeleteObjectModal } from "./DeleteObjectModal"

/** Onglet Orphelins : objets S3 sans ligne media_asset et lignes sans objet, avec purge en lot. */
export function OrphansTab() {
  const result = useMediaOrphans()
  const { deleteObject, deleteAsset, purgeOrphans } = useMediaActions()
  const [target, setTarget] = useState<MediaObjectView | null>(null)
  const [purgeOpen, setPurgeOpen] = useState(false)

  if (result.isPending) {
    return <LoadingState />
  }
  if (result.error || !result.data) {
    return <ErrorState error={result.error} onRetry={() => void result.refetch()} />
  }

  const { objects, assets } = result.data
  const empty = objects.length === 0 && assets.length === 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {objects.length} objet(s) S3 sans ligne · {assets.length} ligne(s) sans objet
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={result.isFetching}
            onClick={() => void result.refetch()}
          >
            <RefreshCw
              className={result.isFetching ? "size-4 animate-spin" : "size-4"}
              aria-hidden
            />
            Rafraîchir
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={empty || purgeOrphans.isPending}
            onClick={() => setPurgeOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden />
            Purger les orphelins
          </Button>
        </div>
      </div>

      {empty ? (
        <EmptyState
          title="Aucun orphelin"
          description="Le bucket et le catalogue média sont cohérents."
        />
      ) : (
        <>
          {objects.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border bg-background">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-2 font-medium">Objet sans catalogue</th>
                    <th className="px-4 py-2 font-medium">Taille</th>
                    <th className="px-4 py-2 font-medium">Modifié</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {objects.map((object) => (
                    <tr key={object.key}>
                      <td className="max-w-[420px] px-4 py-2">
                        <a
                          className="block truncate font-mono text-xs underline-offset-2 hover:underline"
                          href={object.url}
                          target="_blank"
                          rel="noreferrer"
                          title={object.key}
                        >
                          {object.key}
                        </a>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {formatBytes(object.sizeBytes)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {formatDateTime(object.lastModified)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setTarget(object)}
                        >
                          Supprimer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {assets.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border bg-background">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-2 font-medium">Ligne media_asset sans objet</th>
                    <th className="px-4 py-2 font-medium">Joueur</th>
                    <th className="px-4 py-2 font-medium">Taille</th>
                    <th className="px-4 py-2 font-medium">Créée le</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="max-w-[360px] px-4 py-2">
                        <span
                          className="block truncate font-mono text-xs"
                          title={asset.objectKey}
                        >
                          {asset.objectKey}
                        </span>
                        <span className="block truncate font-mono text-[11px] text-muted-foreground">
                          {asset.id}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">{asset.uploadedBy}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {formatBytes(asset.sizeBytes)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {formatDateTime(asset.createdAt)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleteAsset.isPending}
                          onClick={() => deleteAsset.mutate(asset.id)}
                        >
                          Supprimer la ligne
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      )}

      <DeleteObjectModal
        object={target}
        pending={deleteObject.isPending}
        onClose={() => setTarget(null)}
        onConfirm={(key, force) =>
          deleteObject.mutate({ key, force }, { onSuccess: () => setTarget(null) })
        }
      />

      <Modal
        open={purgeOpen}
        onClose={() => setPurgeOpen(false)}
        title="Purger les orphelins"
        description="Supprime les objets uploads/ sans ligne media_asset et les lignes sans objet."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPurgeOpen(false)}
              disabled={purgeOrphans.isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={purgeOrphans.isPending}
              onClick={() =>
                purgeOrphans.mutate(undefined, {
                  onSuccess: () => setPurgeOpen(false),
                })
              }
            >
              Purger
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Les objets encore référencés par un sujet, une question ou un profil sont conservés
          automatiquement. Les images du seed ne sont jamais purgées par cette action.
        </p>
      </Modal>
    </div>
  )
}
