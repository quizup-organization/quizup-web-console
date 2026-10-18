import { Button } from "@/components/ui/button"

/** Pagination simple page précédente / suivante (masquée quand une seule page). */
export function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (page: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-end gap-2 text-sm">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 0}
        onClick={() => onPage(page - 1)}
      >
        Précédent
      </Button>
      <span className="text-muted-foreground">
        Page {page + 1} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages - 1}
        onClick={() => onPage(page + 1)}
      >
        Suivant
      </Button>
    </div>
  )
}
