"use client"

import * as React from "react"
import {
  LayoutDashboard,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  FlaskConical,
  UserCheck,
  Bell,
  Utensils,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { set } from "better-auth"
import { useEffect, useState } from "react"

// FoodMission Data Dashboard Navigation
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "FoodMission EU",
      logo: GalleryVerticalEnd,
      plan: "Research",
    },
    {
      name: "Regional Partners",
      logo: AudioWaveform,
      plan: "Collaboration",
    },
    {
      name: "Analytics Team",
      logo: Command,
      plan: "Data Science",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
  ],
  research: [
    {
      name: "Dietary Baseline",
      url: "/dietary-baseline",
      icon: Utensils,
    },
    {
      name: "Behavior Change",
      url: "/behavior-change",
      icon: FlaskConical,
    },
    {
      name: "Social Influence",
      url: "/social-influence",
      icon: UserCheck,
    },
    {
      name: "Waste Tracking",
      url: "/waste-reminders",
      icon: Bell,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<{
    name: string
    email: string
    avatar: string
  }>();

  useEffect(() => {
    async function fetchUser() {
      const session = await authClient.getSession();
      const user = session?.data?.user;
      if (user) {
        setUser({
          name: user.name,
          email: user.email,
          avatar: user.image ?? "",
        });
      } else {
        setUser(undefined);
      }
    }
    fetchUser();
  }, [])




  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.research} />
      </SidebarContent>
      <SidebarFooter>
        {
          user && <NavUser user={user} />
        }
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
