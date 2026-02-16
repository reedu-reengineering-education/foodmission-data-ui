"use client"

import * as React from "react"
import {
  BarChart3,
  Leaf,
  TrendingUp,
  Users,
  MapPin,
  Wheat,
  Truck,
  Apple,
  Trash2,
  LayoutDashboard,
  Settings2,
  FileText,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
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
      title: "Overview",
      url: "/",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/",
        },
        {
          title: "Key Metrics",
          url: "/metrics",
        },
        {
          title: "Reports",
          url: "/reports",
        },
      ],
    },
    {
      title: "Regional Analysis",
      url: "/regional",
      icon: MapPin,
      items: [
        {
          title: "Geographic Overview",
          url: "/regional",
        },
        {
          title: "Country Comparison",
          url: "/regional/comparison",
        },
        {
          title: "Urban vs Rural",
          url: "/regional/urban-rural",
        },
      ],
    },
    {
      title: "Supply Chain",
      url: "/supply-chain",
      icon: Truck,
      items: [
        {
          title: "Flow Analysis",
          url: "/supply-chain",
        },
        {
          title: "Distribution",
          url: "/supply-chain/distribution",
        },
        {
          title: "Efficiency Metrics",
          url: "/supply-chain/efficiency",
        },
      ],
    },
    {
      title: "Sustainability",
      url: "/sustainability",
      icon: Leaf,
      items: [
        {
          title: "Carbon Footprint",
          url: "/sustainability",
        },
        {
          title: "Resource Usage",
          url: "/sustainability/resources",
        },
        {
          title: "Environmental Impact",
          url: "/sustainability/impact",
        },
      ],
    },
    {
      title: "Nutrition & Health",
      url: "/nutrition",
      icon: Apple,
      items: [
        {
          title: "Dietary Patterns",
          url: "/nutrition",
        },
        {
          title: "Nutritional Quality",
          url: "/nutrition/quality",
        },
        {
          title: "Health Indicators",
          url: "/nutrition/health",
        },
      ],
    },
    {
      title: "Food Waste",
      url: "/food-waste",
      icon: Trash2,
      items: [
        {
          title: "Waste Analysis",
          url: "/food-waste",
        },
        {
          title: "By Sector",
          url: "/food-waste/sectors",
        },
        {
          title: "Reduction Trends",
          url: "/food-waste/trends",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Production Data",
      url: "/production",
      icon: Wheat,
    },
    {
      name: "Consumer Behavior",
      url: "/consumers",
      icon: Users,
    },
    {
      name: "Market Trends",
      url: "/trends",
      icon: TrendingUp,
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
        <NavProjects projects={data.projects} />
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
