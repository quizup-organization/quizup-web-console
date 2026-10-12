import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import { usersService } from "../lib/users"

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => usersService.get(),
  })
}
