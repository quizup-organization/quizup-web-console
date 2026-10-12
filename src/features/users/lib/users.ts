import { api } from "@/lib/api"
import { ENDPOINTS } from "@/lib/endpoints"

export interface UsersView {
  currentUser: {
    userId: string
    email: string
    roles: string[]
  }
  actors: Array<{
    actor: string
    actions: number
  }>
}

export const usersService = {
  get: (): Promise<UsersView> => api.get<UsersView>(ENDPOINTS.console.users),
}
