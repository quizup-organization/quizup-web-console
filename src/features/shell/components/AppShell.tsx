import { NavLink, Outlet } from "react-router-dom"
import {
  Activity,
  Inbox,
  LayoutList,
  LogOut,
  ScrollText,
  ServerCog,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { redirectToLogout, useSessionProfile } from "@/features/auth"
import { cn } from "@/lib/utils"

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const NAV: NavItem[] = [
  { to: "/applications", label: "Applications", icon: LayoutList },
  { to: "/processors", label: "Processors", icon: Activity },
  { to: "/dlq", label: "Dead Letters", icon: Inbox },
  { to: "/audit", label: "Audit", icon: ScrollText },
]

export function AppShell() {
  const profile = useSessionProfile()

  return (
    <div className="flex min-h-dvh bg-muted/20">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-background md:flex">
        <div className="flex h-14 items-center gap-2 px-4">
          <ServerCog className="size-5 text-primary" aria-hidden />
          <span className="font-heading text-sm font-semibold">QuizUp Console</span>
        </div>
        <Separator />
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )
              }
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-3 text-xs text-muted-foreground">
          Axon Framework 4.13 · admin
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
          <nav className="flex items-center gap-1 md:hidden">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className={({ isActive }) =>
                  cn(
                    "grid size-9 place-items-center rounded-md",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )
                }
              >
                <item.icon className="size-4" aria-hidden />
              </NavLink>
            ))}
          </nav>
          <div className="hidden text-sm text-muted-foreground md:block">
            Exploitation des applications Axon — processors, DLQ, replay et audit.
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {profile?.email ?? profile?.name ?? "administrateur"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void redirectToLogout()}
            >
              <LogOut className="size-4" aria-hidden />
              Déconnexion
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
