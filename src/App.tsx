import { QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "sonner"

import { SessionBootstrap } from "@/features/auth"
import { queryClient } from "@/lib/query-client"
import { AppRoutes } from "@/routes"

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionBootstrap>
          <AppRoutes />
          <Toaster position="top-right" richColors closeButton />
        </SessionBootstrap>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
