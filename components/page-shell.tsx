"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

// Parent URL segments that act as grouping levels in the breadcrumb
const SEGMENT_META: Record<string, { label: string; href: string }> = {
  "meal-log": { label: "Meal Log", href: "/meal-log/nutrition-analytics" },
  "shopping-list": { label: "Shopping List", href: "/shopping-list/item-popularity" },
};

interface PageShellProps {
  title: string;
  children: React.ReactNode;
}

export function PageShell({ title, children }: PageShellProps) {
  const pathname = usePathname();
  const parentSegments = pathname.split("/").filter(Boolean).slice(0, -1);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">FOODMISSION Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              {parentSegments.map((seg) => {
                const meta = SEGMENT_META[seg];
                if (!meta) return null;
                return (
                  <React.Fragment key={seg}>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href={meta.href}>{meta.label}</BreadcrumbLink>
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      {children}
    </SidebarInset>
  );
}
