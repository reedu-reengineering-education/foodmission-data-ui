import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Map, MapMarker, MarkerContent, MarkerTooltip } from "@/components/ui/map";
import { Card, CardHeader, CardDescription, CardTitle, CardAction, CardFooter } from "@/components/ui/card";
import { TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";



const analyticsData = [
  { lng: 10.7522, lat: 59.9139, city: "Norway", users: 320, size: 12 },        // Oslo
  { lng: 4.9041, lat: 52.3676, city: "Netherlands", users: 280, size: 11 },   // Amsterdam
  { lng: 13.4050, lat: 52.5200, city: "Germany", users: 450, size: 14 },      // Berlin
  { lng: 21.0122, lat: 52.2297, city: "Poland", users: 210, size: 10 },       // Warsaw
  { lng: -3.7038, lat: 40.4168, city: "Spain", users: 390, size: 13 },        // Madrid
  { lng: 12.4964, lat: 41.9028, city: "Italy", users: 370, size: 13 },        // Rome
  { lng: 14.5058, lat: 46.0569, city: "Slovenia", users: 95, size: 7 },       // Ljubljana
  { lng: 23.7275, lat: 37.9838, city: "Greece", users: 160, size: 9 },        // Athens
];


export default async function Home() {

  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });
  if (!session) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
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
                  <BreadcrumbLink href="#">
                    Build Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl overflow-hidden md:col-span-2">
              <Map center={[8, 51]} zoom={2.8} projection={{ type: "globe" }}>
                {analyticsData.map((loc) => (
                  <MapMarker key={loc.city} longitude={loc.lng} latitude={loc.lat}>
                    <MarkerContent>
                      <div className="relative flex items-center justify-center">
                        <div
                          className="absolute rounded-full bg-emerald-500/20"
                          style={{
                            width: loc.size * 2.5,
                            height: loc.size * 2.5,
                          }}
                        />
                        <div
                          className="absolute rounded-full bg-emerald-500/40 animate-ping"
                          style={{
                            width: loc.size * 1.5,
                            height: loc.size * 1.5,
                            animationDuration: "2s",
                          }}
                        />
                        <div
                          className="relative rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
                          style={{ width: loc.size, height: loc.size }}
                        />
                      </div>
                    </MarkerContent>
                    <MarkerTooltip>
                      <div className="text-center">
                        <div className="font-medium">{loc.city}</div>
                        <div className="text-emerald-500 font-semibold">
                          {loc.users}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          active users
                        </div>
                      </div>
                    </MarkerTooltip>
                  </MapMarker>
                ))}
              </Map>
            </div>
            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Total Revenue</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  $1,250.00
                </CardTitle>
                <CardAction>
                  <Badge>
                    <TrendingUpIcon />
                    +12.5%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Trending up this month <TrendingUpIcon className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Visitors for the last 6 months
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider >
  );
}
