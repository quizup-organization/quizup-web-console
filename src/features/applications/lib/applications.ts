import { api } from "@/lib/api"
import { ENDPOINTS } from "@/lib/endpoints"

export interface InstanceView {
  application: string
  instanceId: string
  version: string | null
  uptimeSeconds: number
  firstSeen: string
  lastSeen: string
}

export const applicationsService = {
  list: (): Promise<InstanceView[]> =>
    api.get<InstanceView[]>(ENDPOINTS.console.applications),
}
