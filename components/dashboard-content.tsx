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
} from "@/components/ui/map";

// Mock data for FoodMission dashboard
const foodProductionData = [
  { country: "Norway", production: 5200, size: 11 },
  { country: "Netherlands", production: 8500, size: 13 },
  { country: "Germany", production: 12400, size: 15 },
  { country: "Poland", production: 6800, size: 12 },
  { country: "Spain", production: 15200, size: 16 },
  { country: "Italy", production: 14800, size: 16 },
  { country: "Slovenia", production: 2400, size: 9 },
  { country: "Greece", production: 7100, size: 12 },
];

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
  { category: "Fruits", consumption: 85 },
  { category: "Vegetables", consumption: 78 },
  { category: "Grains", consumption: 92 },
  { category: "Proteins", consumption: 88 },
  { category: "Dairy", consumption: 81 },
];

export function DashboardContent() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total Production</CardDescription>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72,400 MT</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUpIcon className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+12.3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Active Regions</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28 Regions</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUpIcon className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+4</span> new this quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Sustainability Score</CardDescription>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82/100</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUpIcon className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+8 points</span> improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Food Waste Reduction</CardDescription>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-19.8%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDownIcon className="h-3 w-3 text-green-500" />
              <span className="text-green-500">Good</span> progress on target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Visualization Section */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Geographic Map */}
        <Card className="md:col-span-4 p-0 overflow-hidden">
          <Map center={[8, 51]} zoom={2.5} projection={{ type: "globe" }}>
            {mapLocations.map((loc) => (
              <MapMarker key={loc.city} longitude={loc.lng} latitude={loc.lat}>
                <MarkerContent>
                  <div className="relative flex items-center justify-center">
                    <div
                      className="absolute rounded-full bg-blue-500/20"
                      style={{
                        width: loc.size * 2.5,
                        height: loc.size * 2.5,
                      }}
                    />
                    <div
                      className="absolute rounded-full bg-blue-500/40 animate-ping"
                      style={{
                        width: loc.size * 1.5,
                        height: loc.size * 1.5,
                        animationDuration: "2s",
                      }}
                    />
                    <div
                      className="relative rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"
                      style={{ width: loc.size, height: loc.size }}
                    />
                  </div>
                </MarkerContent>
                <MarkerTooltip>
                  <div className="text-center">
                    <div className="font-medium">{loc.country}</div>
                    <div className="text-blue-500 font-semibold">
                      {loc.production.toLocaleString()} MT
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      monthly production
                    </div>
                  </div>
                </MarkerTooltip>
              </MapMarker>
            ))}
          </Map>
        </Card>

        {/* Production by Country */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Production by Country</CardTitle>
            <CardDescription>Monthly tonnage (MT)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                production: {
                  label: "Production",
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
        {/* Production & Waste Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Production & Waste Trends</CardTitle>
            <CardDescription>6-month trend analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                production: {
                  label: "Production (MT)",
                  color: "var(--chart-2)",
                },
                waste: {
                  label: "Waste (MT)",
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
            Production increasing while waste is decreasing - positive trend
          </CardFooter>
        </Card>

        {/* Nutrition Consumption */}
        <Card>
          <CardHeader>
            <CardTitle>Nutrition Category Consumption</CardTitle>
            <CardDescription>
              Average consumption index by food category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                consumption: {
                  label: "Consumption Index",
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
            Balanced consumption across major food categories
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
