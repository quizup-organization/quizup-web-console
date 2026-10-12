import type { ReactNode } from "react"

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: string
  tone?: "default" | "warning" | "danger" | "success"
}

const TONES: Record<string, string> = {
  default: "text-foreground",
  warning: "text-amber-600",
  danger: "text-destructive",
  success: "text-emerald-600",
}

export function StatCard({ label, value, hint, tone = "default" }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${TONES[tone]}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
