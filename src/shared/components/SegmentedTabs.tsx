import type { ReactNode } from "react"

/** Onglets segmentés (filtres de vue) — même rendu que la page Questions. */
export function SegmentedTabs({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex h-9 items-center rounded-md border border-border p-0.5">
      {children}
    </div>
  )
}

export function SegmentedTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 rounded px-3 text-xs transition-colors ${
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}
