export type MetricsRange = "1h" | "6h" | "24h"

const LABELS: Record<MetricsRange, string> = {
  "1h": "1 h",
  "6h": "6 h",
  "24h": "24 h",
}

export function RangeSelector({
  value,
  onChange,
}: {
  value: MetricsRange
  onChange: (range: MetricsRange) => void
}) {
  return (
    <div className="inline-flex rounded-md border border-border p-0.5">
      {(Object.keys(LABELS) as MetricsRange[]).map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => onChange(range)}
          className={`rounded px-3 py-1 text-xs transition-colors ${
            value === range
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {LABELS[range]}
        </button>
      ))}
    </div>
  )
}
