/**
 * Décodage local du JWT d'accès (payload uniquement, jamais de vérification de signature :
 * l'autorisation réelle est portée par l'API `quizup-console` qui exige `ROLE_ADMIN`).
 */
export interface SessionProfile {
  sub?: string
  email?: string
  name?: string
  roles: string[]
}

export function decodeAccessToken(token: string): SessionProfile {
  try {
    const payload = JSON.parse(decodeBase64Url(token.split(".")[1] ?? "")) as {
      sub?: string
      email?: string
      name?: string
      preferred_username?: string
      roles?: unknown
    }
    const roles = Array.isArray(payload.roles)
      ? payload.roles
          .filter((role): role is string => typeof role === "string")
          .map((role) => (role.startsWith("ROLE_") ? role : `ROLE_${role}`))
      : []
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.preferred_username,
      roles,
    }
  } catch {
    return { roles: [] }
  }
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
  return atob(padded)
}
