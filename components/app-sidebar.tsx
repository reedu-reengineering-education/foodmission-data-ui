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
      url: "/meal-log/nutrition-analytics",
      icon: Soup,
      items: [
        { title: "Nutrition", url: "/meal-log/nutrition-analytics" },
        { title: "Food Popularity", url: "/meal-log/food-popularity" },
        { title: "Meal Patterns", url: "/meal-log/meal-patterns" },
        { title: "Sustainability", url: "/meal-log/sustainability" },
        { title: "Meal Classification", url: "/meal-log/meal-classification" },
        { title: "Demographic Insights", url: "/meal-log/demographic-insights" },
      ],
    },
    {
      title: "Pantry",
      url: "/pantry-analytics",
      icon: Boxes,
      disabled: true,
      items: [
        { title: "Nutrition", url: "/meal-log/nutrition-analytics" },
        { title: "Food Popularity", url: "/meal-log/food-popularity" },
        { title: "Meal Patterns", url: "/meal-log/meal-patterns" },
        { title: "Sustainability", url: "/meal-log/sustainability" },
        { title: "Meal Classification", url: "/meal-log/meal-classification" },
        { title: "Demographic Insights", url: "/meal-log/demographic-insights" },
      ],
    },
    {
      title: "Shopping List",
      url: "/shopping-list/item-popularity",
      icon: ShoppingCart,
      items: [
        { title: "Item Popularity", url: "/shopping-list/item-popularity" },
        { title: "List Patterns", url: "/shopping-list/list-patterns" },
        { title: "Nutrition Profile", url: "/shopping-list/nutrition-profile" },
        { title: "Sustainability", url: "/shopping-list/sustainability" },
        { title: "Demographic Insights", url: "/shopping-list/demographic-insights" },
        { title: "Cross-dimensional", url: "/shopping-list/cross-dimensional" },
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
