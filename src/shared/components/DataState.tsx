import { AlertTriangle, Inbox } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { ApiError } from "@/shared/types/api"

export function LoadingState({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Chargement">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}

export function EmptyState({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-background p-10 text-center">
      <Inbox className="size-6 text-muted-foreground" aria-hidden />
      <p className="font-medium">{title}</p>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown
  onRetry?: () => void
}) {
  const apiError = error as ApiError
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-8 text-center">
      <AlertTriangle className="size-6 text-destructive" aria-hidden />
      <p className="text-sm text-destructive">
        {apiError?.message ?? "Impossible de charger les données."}
      </p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Réessayer
        </Button>
      ) : null}
    </div>
  )
}
