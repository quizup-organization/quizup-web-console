import { NavLink, Outlet } from "react-router-dom"
import {
  Activity,
  CalendarClock,
  Gauge,
  Images,
  Inbox,
  LayoutList,
  LogOut,
  MessageSquareWarning,
  MessagesSquare,
  ScrollText,
  Search,
  ServerCog,
  ShieldAlert,
  Terminal,
  Users,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { redirectToLogout, useSessionProfile } from "@/features/auth"
import { useQuestionSummary } from "@/features/questions"
import { useUserModerationSummary } from "@/features/user-moderation"
import { cn } from "@/lib/utils"

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/applications", label: "Applications", icon: LayoutList },
  { to: "/processors", label: "Processors", icon: Activity },
  { to: "/commands", label: "Commandes", icon: Terminal },
  { to: "/queries", label: "Queries", icon: MessagesSquare },
  { to: "/scheduled-events", label: "Scheduled", icon: CalendarClock },
  { to: "/search", label: "Recherche", icon: Search },
  { to: "/dlq", label: "Dead Letters", icon: Inbox },
  { to: "/media", label: "Médias", icon: Images },
  { to: "/questions", label: "Questions", icon: MessageSquareWarning },
  { to: "/user-reports", label: "Signalements joueurs", icon: ShieldAlert },
  { to: "/users", label: "Utilisateurs", icon: Users },
  { to: "/audit", label: "Audit", icon: ScrollText },
]

export function AppShell() {
  const profile = useSessionProfile()
  const questionSummary = useQuestionSummary()
  const userModerationSummary = useUserModerationSummary()
  const openReports = questionSummary.data?.openReports ?? 0
  const openUserReports = userModerationSummary.data?.openReports ?? 0

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
              end={item.to === "/"}
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
              {item.to === "/questions" && openReports > 0 ? (
                <span className="ml-auto rounded-full bg-destructive px-1.5 py-0.5 text-2xs text-white">
                  {openReports}
                </span>
              ) : null}
              {item.to === "/user-reports" && openUserReports > 0 ? (
                <span className="ml-auto rounded-full bg-destructive px-1.5 py-0.5 text-2xs text-white">
                  {openUserReports}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-3 text-xs text-muted-foreground">
          Axon Framework 4.13 · admin
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
          <nav className="flex items-center gap-1 overflow-x-auto md:hidden">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                aria-label={item.label}
                className={({ isActive }) =>
                  cn(
                    "relative grid size-9 shrink-0 place-items-center rounded-md",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )
                }
              >
                <item.icon className="size-4" aria-hidden />
                {item.to === "/questions" && openReports > 0 ? (
                  <span className="absolute right-1 top-1 size-1.5 rounded-full bg-destructive" />
                ) : null}
                {item.to === "/user-reports" && openUserReports > 0 ? (
                  <span className="absolute right-1 top-1 size-1.5 rounded-full bg-destructive" />
                ) : null}
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
