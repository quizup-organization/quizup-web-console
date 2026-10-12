import { Loader2 } from "lucide-react"

export function FullScreenLoader({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center" role="status">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" aria-hidden />
        <span>{label}</span>
      </div>
    </div>
  )
}
