/** Types et transformations des résultats Prometheus servis par l'API console. */

export interface PrometheusSample {
  timestamp: string
  value: number
}

export interface PrometheusSeries {
  metric: Record<string, string>
  samples: PrometheusSample[]
}

export interface PrometheusResult {
  enabled: boolean
  series: PrometheusSeries[]
}

export interface ChartData {
  data: Array<Record<string, number | string>>
  series: string[]
}

/**
 * Fusionne les séries Prometheus en lignes de graphique (une colonne par label).
 */
export function seriesToChart(
  result: PrometheusResult | undefined,
  labelKey = "result",
): ChartData {
  if (!result?.series?.length) {
    return { data: [], series: [] }
  }
  const rows = new Map<string, Record<string, number | string>>()
  const names = new Set<string>()
  for (const series of result.series) {
    const name = series.metric[labelKey] ?? series.metric.name ?? "valeur"
    names.add(name)
    for (const sample of series.samples) {
      const row = rows.get(sample.timestamp) ?? { time: sample.timestamp }
      row[name] = sample.value
      rows.set(sample.timestamp, row)
    }
  }
  const data = [...rows.values()].sort((left, right) =>
    String(left.time).localeCompare(String(right.time)),
  )
  return { data, series: [...names] }
}

/** Somme des derniers échantillons d'un résultat (utile pour les compteurs/jauges). */
export function latestTotal(result: PrometheusResult | undefined): number | null {
  if (!result?.series?.length) {
    return null
  }
  let total = 0
  let found = false
  for (const series of result.series) {
    const last = series.samples.at(-1)
    if (last && Number.isFinite(last.value)) {
      total += last.value
      found = true
    }
  }
  return found ? total : null
}

/** Valeur d'une série identifiée par un label (ex. `result="failure"`). */
export function valueFor(
  result: PrometheusResult | undefined,
  labelKey: string,
  labelValue: string,
): number | null {
  const series = result?.series.find(
    (entry) => entry.metric[labelKey] === labelValue,
  )
  const last = series?.samples.at(-1)
  return last && Number.isFinite(last.value) ? last.value : null
}

export function formatNumber(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—"
  }
  return value.toLocaleString("fr-FR", { maximumFractionDigits: digits })
}

/** Taille lisible (octets → Ko/Mo/Go). */
export function formatBytes(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—"
  }
  const units = ["o", "Ko", "Mo", "Go", "To"]
  let size = value
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit += 1
  }
  return `${size.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} ${units[unit]}`
}
