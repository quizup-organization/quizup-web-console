/**
 * Passerelle de session : permet à `lib/api.ts` d'accéder au token sans dépendre de la feature
 * `auth` (inversion de dépendance, cf. `best-practices/.frontend/folder-structure.md`).
 */
export interface SessionGateway {
  getAccessToken: () => string | null
  onUnauthorized: () => void
}

let gateway: SessionGateway = {
  getAccessToken: () => null,
  onUnauthorized: () => undefined,
}

export function registerSessionGateway(next: SessionGateway): void {
  gateway = next
}

export const sessionGateway: SessionGateway = {
  getAccessToken: () => gateway.getAccessToken(),
  onUnauthorized: () => gateway.onUnauthorized(),
}
