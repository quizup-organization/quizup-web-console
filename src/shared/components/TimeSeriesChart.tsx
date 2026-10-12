import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { seriesToChart, type PrometheusResult } from "@/lib/metrics"

const COLORS = ["#2563eb", "#dc2626", "#16a34a", "#f59e0b", "#7c3aed", "#0891b2"]

interface TimeSeriesChartProps {
  title: string
  result: PrometheusResult | undefined
  /** Clé de label utilisée comme nom de série (ex. `result`, `name`). */
  labelKey?: string
  unit?: string
  height?: number
}

/**
 * Graphique temporel (recharts) d'un résultat Prometheus : une ligne par série.
 */
export function TimeSeriesChart({
  title,
  result,
  labelKey = "result",
  unit,
  height = 180,
}: TimeSeriesChartProps) {
  const chart = seriesToChart(result, labelKey)
  const hasData = chart.data.length > 0 && chart.series.length > 0

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        {unit ? <span className="text-xs text-muted-foreground">{unit}</span> : null}
      </div>
      {!hasData ? (
        <p className="py-10 text-center text-xs text-muted-foreground">
          {result?.enabled === false
            ? "Prometheus non configuré"
            : "Aucune donnée sur la période"}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chart.data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11 }}
              tickFormatter={(value: string) =>
                new Date(value).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
              minTickGap={40}
            />
            <YAxis tick={{ fontSize: 11 }} width={56} />
            <Tooltip
              formatter={(value) => [
                typeof value === "number"
                  ? value.toLocaleString("fr-FR", { maximumFractionDigits: 3 })
                  : String(value),
                "",
              ]}
              labelFormatter={(label) => new Date(String(label)).toLocaleString("fr-FR")}
            />
            {chart.series.length > 1 ? (
              <Legend wrapperStyle={{ fontSize: 11 }} />
            ) : null}
            {chart.series.map((name, index) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                name={name}
                stroke={COLORS[index % COLORS.length]}
                dot={false}
                strokeWidth={1.8}
                isAnimationActive={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
