/** Formatage des valeurs d'exploitation (dates, uptime, fraîcheur). */

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "medium",
})

const timeFormatter = new Intl.DateTimeFormat("fr-FR", { timeStyle: "medium" })

export function formatDateTime(value?: string | null): string {
  if (!value) {
    return "—"
  }
  return dateTimeFormatter.format(new Date(value))
}

export function formatTime(value?: string | null): string {
  if (!value) {
    return "—"
  }
  return timeFormatter.format(new Date(value))
}

export function formatUptime(seconds?: number | null): string {
  if (seconds === undefined || seconds === null) {
    return "—"
  }
  const days = Math.floor(seconds / 86_400)
  const hours = Math.floor((seconds % 86_400) / 3_600)
  const minutes = Math.floor((seconds % 3_600) / 60)
  if (days > 0) {
    return `${days} j ${hours} h`
  }
  if (hours > 0) {
    return `${hours} h ${minutes} min`
  }
  return `${minutes} min`
}

/** Une instance est considérée hors ligne si son dernier snapshot est ancien. */
export function isStale(lastSeen?: string | null, thresholdMs = 90_000): boolean {
  if (!lastSeen) {
    return true
  }
  return Date.now() - new Date(lastSeen).getTime() > thresholdMs
}

export function formatPosition(position?: number | null): string {
  return position === undefined || position === null ? "—" : position.toLocaleString("fr-FR")
}

/** Taille en octets lisible (o, Ko, Mo, Go, To), décimales françaises. */
export function formatBytes(value?: number | null): string {
  if (value === undefined || value === null) {
    return "—"
  }
  if (value < 1024) {
    return `${value.toLocaleString("fr-FR")} o`
  }
  const units = ["Ko", "Mo", "Go", "To"]
  let size = value / 1024
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit++
  }
  return `${Number(size.toFixed(2)).toLocaleString("fr-FR")} ${units[unit]}`
}
