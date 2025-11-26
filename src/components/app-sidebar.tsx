'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, FileText, PlayCircle, Settings, ArrowLeft } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  projectId: string
  projectName?: string
}

export function AppSidebar({ className, projectId, projectName }: SidebarProps) {
  const pathname = usePathname()
  const baseUrl = `/projects/${projectId}`

  const routes = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      href: `${baseUrl}`,
      active: pathname === baseUrl
    },
    {
      label: "Test Cases",
      icon: FileText,
      href: `${baseUrl}/cases`,
      active: pathname.startsWith(`${baseUrl}/cases`)
    },
    {
      label: "Test Runs",
      icon: PlayCircle,
      href: `${baseUrl}/runs`,
      active: pathname.startsWith(`${baseUrl}/runs`)
    },
    {
      label: "Settings",
      icon: Settings,
      href: `${baseUrl}/settings`,
      active: pathname.startsWith(`${baseUrl}/settings`)
    },
  ]

  return (
    <div className={cn("pb-12 w-64 border-r bg-background h-screen sticky top-0", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 mb-6 px-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-lg font-semibold tracking-tight truncate" title={projectName}>
              {projectName || "Project"}
            </h2>
          </div>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link key={route.href} href={route.href}>
                <Button
                  variant={route.active ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Suites
          </h2>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1 p-2">
              {/* TODO: Render Suite Tree Here */}
              <p className="text-sm text-muted-foreground px-2">No suites created yet.</p>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

