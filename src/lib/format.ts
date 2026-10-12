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
