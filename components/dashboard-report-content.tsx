"use client";

import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { TrendingUpIcon, Users, Leaf, Truck, Apple } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Mock data for FOODMISSION dashboard
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

const foodProductionData = countryUserData.map((d) => ({
  country: d.country,
  production: d.users,
  size: Math.sqrt(d.users / 10) + 8,
}));

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

export function DashboardReportContent() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            FOODMISSION Overview
          </h2>
          <p className="text-muted-foreground">
            European food sustainability platform - User engagement and
            geographic distribution
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

      {/* Users by Country - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle>Users by Country</CardTitle>
          <CardDescription>Active participants per country</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              production: {
                label: "Users",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[350px]"
          >
            <BarChart data={foodProductionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="country"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="production"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

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
                  color: "hsl(var(--chart-2))",
                },
                waste: {
                  label: "Active Users",
                  color: "hsl(var(--chart-3))",
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
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-2))" }}
                />
                <Line
                  type="monotone"
                  dataKey="waste"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-3))" }}
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
                  color: "hsl(var(--chart-4))",
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
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="consumption"
                  fill="hsl(var(--chart-4))"
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

      {/* Country Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Country Distribution Summary</CardTitle>
          <CardDescription>Detailed breakdown by country</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Country</th>
                  <th className="text-right p-2 font-medium">Active Users</th>
                  <th className="text-right p-2 font-medium">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {countryUserData.map((country) => (
                  <tr key={country.code} className="border-b">
                    <td className="p-2">{country.country}</td>
                    <td className="text-right p-2">{country.users}</td>
                    <td className="text-right p-2">
                      {((country.users / 2847) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
