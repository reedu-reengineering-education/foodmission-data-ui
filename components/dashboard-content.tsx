"use client";

import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  Users,
  Leaf,
  Truck,
  Apple,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  useMap,
} from "@/components/ui/map";
import { useEffect } from "react";

// Mock data for FoodMission dashboard
const countryUserData = [
  { country: "Norway", users: 520, code: "NOR" },
  { country: "Netherlands", users: 850, code: "NLD" },
  { country: "Germany", users: 1240, code: "DEU" },
  { country: "Poland", users: 680, code: "POL" },
  { country: "Spain", users: 1520, code: "ESP" },
  { country: "Italy", users: 1480, code: "ITA" },
  { country: "Slovenia", users: 240, code: "SVN" },
  { country: "Greece", users: 710, code: "GRC" },
];

const foodProductionData = countryUserData.map(d => ({
  country: d.country,
  production: d.users,
  size: Math.sqrt(d.users / 10) + 8,
}));

const mapLocations = [
  {
    lng: 10.7522,
    lat: 59.9139,
    city: "Oslo",
    country: "Norway",
    production: 5200,
    size: 11,
  },
  {
    lng: 4.9041,
    lat: 52.3676,
    city: "Amsterdam",
    country: "Netherlands",
    production: 8500,
    size: 13,
  },
  {
    lng: 13.405,
    lat: 52.52,
    city: "Berlin",
    country: "Germany",
    production: 12400,
    size: 15,
  },
  {
    lng: 21.0122,
    lat: 52.2297,
    city: "Warsaw",
    country: "Poland",
    production: 6800,
    size: 12,
  },
  {
    lng: -3.7038,
    lat: 40.4168,
    city: "Madrid",
    country: "Spain",
    production: 15200,
    size: 16,
  },
  {
    lng: 12.4964,
    lat: 41.9028,
    city: "Rome",
    country: "Italy",
    production: 14800,
    size: 16,
  },
  {
    lng: 14.5058,
    lat: 46.0569,
    city: "Ljubljana",
    country: "Slovenia",
    production: 2400,
    size: 9,
  },
  {
    lng: 23.7275,
    lat: 37.9838,
    city: "Athens",
    country: "Greece",
    production: 7100,
    size: 12,
  },
];

const monthlyTrendsData = [
  { month: "Jan", production: 62000, waste: 8500, sustainability: 72 },
  { month: "Feb", production: 65000, waste: 8200, sustainability: 74 },
  { month: "Mar", production: 68000, waste: 7800, sustainability: 76 },
  { month: "Apr", production: 71000, waste: 7500, sustainability: 78 },
  { month: "May", production: 73000, waste: 7200, sustainability: 80 },
  { month: "Jun", production: 75000, waste: 6800, sustainability: 82 },
];

const nutritionData = [
  { category: "Knowledge", consumption: 92 },
  { category: "Challenges", consumption: 85 },
  { category: "Missions", consumption: 78 },
  { category: "Waste Tracking", consumption: 72 },
  { category: "Social", consumption: 68 },
];

// Choropleth layer component
function CountryChoropleth({ data }: { data: typeof countryUserData }) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!isLoaded || !map) return;

    const sourceId = "countries-choropleth";
    const layerId = "countries-fill";

    // Get theme - check if dark mode
    const isDark = document.documentElement.classList.contains("dark");
    
    // Use teal/cyan colors to match theme
    const maxUsers = Math.max(...data.map(d => d.users));
    const getColor = (users: number) => {
      const intensity = (users / maxUsers);
      if (isDark) {
        // Dark theme: use lighter teal/cyan with more saturation
        const lightness = 45 + (intensity * 25); // 45% to 70%
        return `hsl(180, 75%, ${lightness}%)`;
      } else {
        // Light theme: use darker teal
        const lightness = 65 - (intensity * 35); // 65% to 30%
        return `hsl(180, 65%, ${lightness}%)`;
      }
    };

    // Build color expression that checks ADM0_A3 and NAME fields
    const colorExpression: any = [
      "case",
      ...data.flatMap(d => [
        ["==", ["get", "ADM0_A3"], d.code],
        getColor(d.users),
        ["==", ["get", "NAME"], d.country],
        getColor(d.users),
      ]),
      isDark ? "rgba(100, 100, 100, 0.1)" : "rgba(230, 230, 230, 0.15)" // default color for non-target countries
    ];

    // Add source if it doesn't exist
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "vector",
        url: "https://demotiles.maplibre.org/tiles/tiles.json"
      });
    }

    // Add fill layer
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "fill",
        source: sourceId,
        "source-layer": "countries",
        paint: {
          "fill-color": colorExpression,
          "fill-opacity": 0.8,
        },
      });
    }

    // Add hover effect
    let hoveredCountryId: string | number | null = null;

    const handleMouseMove = (e: any) => {
      if (e.features && e.features.length > 0) {
        if (hoveredCountryId !== null) {
          map.setFeatureState(
            { source: sourceId, sourceLayer: "countries", id: hoveredCountryId },
            { hover: false }
          );
        }
        hoveredCountryId = e.features[0].id;
        map.setFeatureState(
          { source: sourceId, sourceLayer: "countries", id: hoveredCountryId },
          { hover: true }
        );
        map.getCanvas().style.cursor = "pointer";
      }
    };

    const handleMouseLeave = () => {
      if (hoveredCountryId !== null) {
        map.setFeatureState(
          { source: sourceId, sourceLayer: "countries", id: hoveredCountryId },
          { hover: false }
        );
      }
      hoveredCountryId = null;
      map.getCanvas().style.cursor = "";
    };

    map.on("mousemove", layerId, handleMouseMove);
    map.on("mouseleave", layerId, handleMouseLeave);

    return () => {
      map.off("mousemove", layerId, handleMouseMove);
      map.off("mouseleave", layerId, handleMouseLeave);
      
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // ignore
      }
    };
  }, [isLoaded, map, data]);

  return null;
}

export function DashboardContent() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">FoodMission Overview</h2>
          <p className="text-muted-foreground">
            European food sustainability platform - User engagement and geographic distribution
          </p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Active Users</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUpIcon className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+18.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Countries</CardDescription>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8 Countries</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-muted-foreground">Across Europe</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Avg. Module Usage</CardDescription>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2 modules</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUpIcon className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+0.4</span> per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Weekly Engagement</CardDescription>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUpIcon className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+5.2%</span> retention rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Visualization Section */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Geographic Map */}
        <Card className="md:col-span-4 p-0 overflow-hidden">
          <Map center={[10, 50]} zoom={3.5} projection={{ type: "mercator" }}>
            <CountryChoropleth data={countryUserData} />
          </Map>
        </Card>

        {/* Users by Country */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Users by Country</CardTitle>
            <CardDescription>Active participants per country</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                production: {
                  label: "Users",
                  color: "var(--chart-1)",
                },
              }}
              className="h-[300px]"
            >
              <BarChart data={foodProductionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="country"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="production"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trends Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* User Growth & Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth & Engagement</CardTitle>
            <CardDescription>6-month trend analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                production: {
                  label: "New Users",
                  color: "var(--chart-2)",
                },
                waste: {
                  label: "Active Users",
                  color: "var(--chart-3)",
                },
              }}
              className="h-[250px]"
            >
              <LineChart data={monthlyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="production"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={{ fill: "var(--chart-2)" }}
                />
                <Line
                  type="monotone"
                  dataKey="waste"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  dot={{ fill: "var(--chart-3)" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Steady growth in both new user acquisition and active engagement
          </CardFooter>
        </Card>

        {/* Module Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Module Usage Distribution</CardTitle>
            <CardDescription>
              Average engagement by platform module
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                consumption: {
                  label: "Usage Score",
                  color: "var(--chart-4)",
                },
              }}
              className="h-[250px]"
            >
              <BarChart data={nutritionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="category"
                  type="category"
                  width={80}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="consumption"
                  fill="var(--chart-4)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Knowledge and Challenges modules show highest engagement
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
