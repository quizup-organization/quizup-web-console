import { useState } from "react"
import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { queryKeys } from "@/lib/query-keys"
import { PageHeader } from "@/shared/components/PageHeader"
import { MediaStatsCards } from "../components/MediaStatsCards"
import { ObjectsTab } from "../components/ObjectsTab"
import { OrphansTab } from "../components/OrphansTab"
import { UsageTab } from "../components/UsageTab"

type Tab = "objects" | "orphans" | "usage"

const TABS: { value: Tab; label: string }[] = [
  { value: "objects", label: "Objets" },
  { value: "orphans", label: "Orphelins" },
  { value: "usage", label: "Usage" },
]

/**
 * Console média : supervision du bucket MinIO `quizup-media` (API admin du BFF) — listing,
 * références métier, orphelins et quota par joueur. Réservée à `ROLE_ADMIN` (serveur).
 */
export function MediaPage() {
  const [tab, setTab] = useState<Tab>("objects")
  const queryClient = useQueryClient()
  const isFetching = useIsFetching({ queryKey: queryKeys.media.all }) > 0

  return (
    <section className="space-y-4">
      <PageHeader
        title="Médias"
        description="Bucket MinIO quizup-media : uploads du BFF et images du seed, références, orphelins et quota par joueur."
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={isFetching}
            onClick={() =>
              void queryClient.invalidateQueries({ queryKey: queryKeys.media.all })
            }
          >
            <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} aria-hidden />
            Rafraîchir
          </Button>
        }
      />

      <MediaStatsCards />

      <div className="inline-flex h-9 items-center rounded-md border border-border p-0.5">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={`h-8 rounded px-3 text-xs transition-colors ${
              tab === item.value
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "objects" ? (
        <ObjectsTab />
      ) : tab === "orphans" ? (
        <OrphansTab />
      ) : (
        <UsageTab />
      )}
    </section>
  )
}
