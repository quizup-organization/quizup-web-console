import { useState } from "react"
import { Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatBytes, formatDateTime } from "@/lib/format"
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/DataState"
import { FilterBar, FilterField } from "@/shared/components/FilterBar"
import { useMediaObjects } from "../hooks/useMedia"
import { useMediaActions } from "../hooks/useMediaActions"
import type { MediaObjectView, MediaOrigin } from "../lib/media"
import { DeleteObjectModal } from "./DeleteObjectModal"

const ORIGIN_OPTIONS = [
  { value: "ALL", label: "Toutes origines" },
  { value: "UPLOAD", label: "Uploads (BFF)" },
  { value: "SEED", label: "Seed (wikipedia)" },
] as const

function originBadge(object: MediaObjectView) {
  if (object.origin === "UPLOAD") {
    return <Badge variant="outline">upload</Badge>
  }
  if (object.origin === "SEED") {
    return <Badge variant="secondary">seed</Badge>
  }
  return <Badge variant="ghost">{object.origin.toLowerCase()}</Badge>
}

function referenceBadge(referenceCount: number | null) {
  if (referenceCount === null) {
    return (
      <Badge variant="ghost" title="Vérification indisponible">
        ?
      </Badge>
    )
  }
  if (referenceCount === 0) {
    return <Badge variant="secondary">0</Badge>
  }
  return <Badge variant="destructive">{referenceCount}</Badge>
}

function uploadersLabel(uploaders: string[]) {
  if (uploaders.length === 0) {
    return "—"
  }
  const shown = uploaders.slice(0, 2).join(", ")
  return uploaders.length > 2 ? `${shown} +${uploaders.length - 2}` : shown
}

/** Onglet Objets : listing du bucket (uploads + seed), enrichi catalogue et références. */
export function ObjectsTab() {
  const [origin, setOrigin] = useState<MediaOrigin | undefined>(undefined)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [target, setTarget] = useState<MediaObjectView | null>(null)

  const result = useMediaObjects(origin, query)
  const { deleteObject } = useMediaActions()

  const objects = result.data?.pages.flatMap((page) => page.objects) ?? []

  return (
    <div className="space-y-3">
      <FilterBar>
        <FilterField label="Origine">
          <Select
            value={origin ?? "ALL"}
            onValueChange={(value) =>
              setOrigin(value === "ALL" ? undefined : (value as MediaOrigin))
            }
          >
            <SelectTrigger className="w-[190px]" aria-label="Origine">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORIGIN_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Recherche (clé)" className="min-w-[260px] flex-1">
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              setQuery(search.trim())
            }}
          >
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="uploads/, wikipedia/…"
            />
            <Button type="submit" variant="outline" size="sm">
              Filtrer
            </Button>
          </form>
        </FilterField>
      </FilterBar>

      {result.isPending ? (
        <LoadingState />
      ) : result.error ? (
        <ErrorState error={result.error} onRetry={() => void result.refetch()} />
      ) : objects.length === 0 ? (
        <EmptyState
          title="Aucun objet"
          description="Le bucket est vide ou aucun objet ne correspond au filtre."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Clé d'objet</th>
                <th className="px-4 py-2 font-medium">Origine</th>
                <th className="px-4 py-2 font-medium">Taille</th>
                <th className="px-4 py-2 font-medium">Modifié</th>
                <th className="px-4 py-2 font-medium">Catalogue</th>
                <th className="px-4 py-2 font-medium">Références</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {objects.map((object) => (
                <tr key={object.key}>
                  <td className="max-w-[360px] px-4 py-2">
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
                  <td className="px-4 py-2">{originBadge(object)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatBytes(object.sizeBytes)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatDateTime(object.lastModified)}
                  </td>
                  <td className="px-4 py-2">
                    {object.assetCount === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <span className="text-xs">
                        {object.assetCount} ligne(s)
                        <span className="block text-muted-foreground">
                          {uploadersLabel(object.uploaders)}
                        </span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">{referenceBadge(object.referenceCount)}</td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setTarget(object)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result.hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            disabled={result.isFetchingNextPage}
            onClick={() => void result.fetchNextPage()}
          >
            {result.isFetchingNextPage ? "Chargement…" : "Charger plus"}
          </Button>
        </div>
      ) : null}

      <DeleteObjectModal
        object={target}
        pending={deleteObject.isPending}
        onClose={() => setTarget(null)}
        onConfirm={(key, force) =>
          deleteObject.mutate({ key, force }, { onSuccess: () => setTarget(null) })
        }
      />
    </div>
  )
}
