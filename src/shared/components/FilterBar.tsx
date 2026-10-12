import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Barre de filtres homogène (label au-dessus du contrôle). */
export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-background p-3">
      {children}
    </div>
  )
}

export function FilterField({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}
