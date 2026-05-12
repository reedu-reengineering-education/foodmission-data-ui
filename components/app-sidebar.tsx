"use client";

import * as React from "react";
import {
  LayoutDashboard,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  Soup,
  Boxes,
  ShoppingCart,
  AppWindow,
  BookOpen,
  Trash2,
  Brain,
  Share2,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";

// FOODMISSION Data Dashboard Navigation
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "FOODMISSION EU",
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
    {
      title: "Meal Log",
      url: "/nutrition-analytics",
      icon: Soup,
      items: [
        { title: "Nutrition", url: "/nutrition-analytics" },
        { title: "Food Popularity", url: "/food-popularity" },
        { title: "Meal Patterns", url: "/meal-patterns" },
        { title: "Sustainability", url: "/sustainability" },
        { title: "Meal Classification", url: "/meal-classification" },
        { title: "Demographic Insights", url: "/demographic-insights" },
      ],
    },
    {
      title: "Pantry",
      url: "/pantry-analytics",
      icon: Boxes,
      disabled: true,
      items: [
        { title: "Nutrition", url: "/nutrition-analytics" },
        { title: "Food Popularity", url: "/food-popularity" },
        { title: "Meal Patterns", url: "/meal-patterns" },
        { title: "Sustainability", url: "/sustainability" },
        { title: "Meal Classification", url: "/meal-classification" },
        { title: "Demographic Insights", url: "/demographic-insights" },
      ],
    },
    {
      title: "ShoppingList",
      url: "/shoppingList-analytics",
      icon: ShoppingCart,
      disabled: true,
      items: [
        { title: "Nutrition", url: "/nutrition-analytics" },
        { title: "Food Popularity", url: "/food-popularity" },
        { title: "Meal Patterns", url: "/meal-patterns" },
        { title: "Sustainability", url: "/sustainability" },
        { title: "Meal Classification", url: "/meal-classification" },
        { title: "Demographic Insights", url: "/demographic-insights" },
      ],
    },
    {
      title: "Recipes",
      url: "/recipes",
      icon: BookOpen,
      disabled: true,
      items: [],
    },
    {
      title: "Food Waste",
      url: "/food-waste",
      icon: Trash2,
      disabled: true,
      items: [],
    },
  ],
  appAnalytics: [
    {
      title: "App Analytics",
      url: "/app-analytics",
      icon: AppWindow,
      disabled: true,
      items: [],
    },
  ],
  personalData: [
    {
      title: "Personal Food Profile",
      url: "/personal-profile",
      icon: Soup,
      disabled: true,
      items: [],
    },
  ],
  research: [
    {
      name: "Behavior Change",
      url: "/behavior-change",
      icon: Brain,
      disabled: true,
    },
    {
      name: "Social Influence",
      url: "/social-influence",
      icon: Share2,
      disabled: true,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
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
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} label="Citizen Science Data" />
        <NavMain items={data.appAnalytics} label="Analytics" />
        <NavMain items={data.personalData} label="Personal Data" />
        <NavProjects projects={data.research} />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
