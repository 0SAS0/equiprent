"use client"

import * as React from "react"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, UsersIcon, Blocks, Clock3, CornerDownLeft, ChartLine, Box } from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Equipment",
      url: "/equipment",
      icon: (
        <Box />
      ),
    },
    {
      title: "Reservations",
      url: "/reservations",
      icon: (
        <Clock3 />
      ),
    },
    {
      title: "Returns",
      url: "/returns",
      icon: (
        <CornerDownLeft />
      ),
    },
    {
      title: "Reports",
      url: "/reports",
      icon: (
        <ChartLine />
      ),
    },
    {
      title: "Users",
      url: "/users",
      icon: (
        <UsersIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <Blocks className="size-4 text-white" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">EquipRent</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest">
                    Technical University
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
