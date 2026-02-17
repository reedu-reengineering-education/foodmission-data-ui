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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";

// Research Question: Does greater social connectedness influence behavior change?
// Note: All users have access to social features; analysis compares by actual usage and connection patterns

// Social network size vs behavior change
const socialNetworkData = [
  { connections: 2, behaviorChange: 8.2, users: 45 },
  { connections: 5, behaviorChange: 12.5, users: 78 },
  { connections: 10, behaviorChange: 18.3, users: 120 },
  { connections: 15, behaviorChange: 24.7, users: 95 },
  { connections: 20, behaviorChange: 28.1, users: 68 },
  { connections: 25, behaviorChange: 31.5, users: 52 },
  { connections: 30, behaviorChange: 33.8, users: 38 },
  { connections: 40, behaviorChange: 35.2, users: 22 },
  { connections: 50, behaviorChange: 36.1, users: 15 },
];

// Engagement type vs sustainability improvement
const engagementTypeData = [
  { type: "No Social", users: 420, improvement: 8.5, retention: 45 },
  { type: "Passive Viewer", users: 680, improvement: 12.3, retention: 58 },
  { type: "Occasional Liker", users: 520, improvement: 16.8, retention: 65 },
  { type: "Regular Commenter", users: 340, improvement: 24.2, retention: 78 },
  { type: "Active Sharer", users: 280, improvement: 29.5, retention: 85 },
  { type: "Community Leader", users: 120, improvement: 35.7, retention: 92 },
];

// Social influence over time
const socialTimeSeriesData = [
  { week: "Week 1", isolated: 42, lowSocial: 44, medSocial: 46, highSocial: 48 },
  { week: "Week 2", isolated: 43, lowSocial: 46, medSocial: 50, highSocial: 53 },
  { week: "Week 3", isolated: 44, lowSocial: 48, medSocial: 54, highSocial: 59 },
  { week: "Week 4", isolated: 45, lowSocial: 50, medSocial: 58, highSocial: 65 },
  { week: "Week 5", isolated: 46, lowSocial: 52, medSocial: 62, highSocial: 71 },
  { week: "Week 6", isolated: 47, lowSocial: 54, medSocial: 66, highSocial: 76 },
  { week: "Week 7", isolated: 48, lowSocial: 55, medSocial: 69, highSocial: 81 },
  { week: "Week 8", isolated: 48, lowSocial: 56, medSocial: 72, highSocial: 85 },
];

// Peer influence on specific behaviors
const peerInfluenceData = [
  { behavior: "Try New Recipe", withPeers: 78, withoutPeers: 42 },
  { behavior: "Reduce Meat", withPeers: 65, withoutPeers: 38 },
  { behavior: "Track Waste", withPeers: 72, withoutPeers: 45 },
  { behavior: "Buy Local", withPeers: 81, withoutPeers: 52 },
  { behavior: "Share Progress", withPeers: 88, withoutPeers: 28 },
  { behavior: "Join Challenge", withPeers: 84, withoutPeers: 35 },
];

// Network density vs collective impact
const networkDensityData = [
  { density: 0.1, collectiveImpact: 12.5, avgConnections: 3 },
  { density: 0.2, collectiveImpact: 18.2, avgConnections: 6 },
  { density: 0.3, collectiveImpact: 24.8, avgConnections: 9 },
  { density: 0.4, collectiveImpact: 32.1, avgConnections: 12 },
  { density: 0.5, collectiveImpact: 38.5, avgConnections: 15 },
  { density: 0.6, collectiveImpact: 43.2, avgConnections: 18 },
  { density: 0.7, collectiveImpact: 46.8, avgConnections: 21 },
];

export function SocialInfluenceContent() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Social Influence Analysis</h2>
          <p className="text-muted-foreground">
            Impact of social connectedness on behavior change
          </p>
        </div>
      </div>

      {/* Visualization 1: Social Network Size vs Behavior Change */}
      <Card>
        <CardHeader>
          <CardTitle>Social Network Size vs Behavior Change</CardTitle>
          <CardDescription>
            Relationship between number of connections and sustainability improvement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              behaviorChange: { label: "Behavior Change Score", color: "var(--chart-1)" },
              users: { label: "Number of Users", color: "var(--chart-2)" },
            }}
            className="h-[350px]"
          >
            <ComposedChart data={socialNetworkData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="connections" tick={{ fontSize: 11 }} label={{ value: "Number of Connections", position: "insideBottom", offset: -5 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: "Behavior Change (%)", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: "Users", angle: 90, position: "insideRight" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line yAxisId="left" type="monotone" dataKey="behaviorChange" stroke="var(--chart-1)" strokeWidth={3} />
              <Bar yAxisId="right" dataKey="users" fill="var(--chart-2)" opacity={0.3} />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Strong positive correlation between social connections and behavior change (r=0.89)
        </CardFooter>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Visualization 2: Engagement Type Impact */}
        <Card>
          <CardHeader>
            <CardTitle>Social Engagement Level Impact</CardTitle>
            <CardDescription>
              Sustainability improvement by engagement type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                improvement: { label: "Improvement (%)", color: "var(--chart-3)" },
                retention: { label: "Retention Rate (%)", color: "var(--chart-4)" },
              }}
              className="h-[350px]"
            >
              <BarChart data={engagementTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="improvement" fill="var(--chart-3)" />
                <Bar dataKey="retention" fill="var(--chart-4)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Active engagement correlates with both improvement and retention
          </CardFooter>
        </Card>

        {/* Visualization 3: Peer Influence on Behaviors */}
        <Card>
          <CardHeader>
            <CardTitle>Peer Influence on Specific Behaviors</CardTitle>
            <CardDescription>
              Adoption rate with vs without peer connections (%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                withPeers: { label: "With Peers", color: "var(--chart-1)" },
                withoutPeers: { label: "Without Peers", color: "var(--chart-5)" },
              }}
              className="h-[350px]"
            >
              <BarChart data={peerInfluenceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="behavior" type="category" width={110} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="withPeers" fill="var(--chart-1)" />
                <Bar dataKey="withoutPeers" fill="var(--chart-5)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Peer connections double adoption rates for most behaviors
          </CardFooter>
        </Card>
      </div>

      {/* Visualization 4: Social Influence Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Sustainability Score by Social Connectedness</CardTitle>
          <CardDescription>
            8-week progression by social network size
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              isolated: { label: "Isolated (0 connections)", color: "var(--chart-5)" },
              lowSocial: { label: "Low Social (1-5)", color: "var(--chart-4)" },
              medSocial: { label: "Medium Social (6-15)", color: "var(--chart-2)" },
              highSocial: { label: "High Social (16+)", color: "var(--chart-1)" },
            }}
            className="h-[350px]"
          >
            <AreaChart data={socialTimeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[40, 90]} label={{ value: "Sustainability Score", angle: -90, position: "insideLeft" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area type="monotone" dataKey="isolated" stroke="var(--chart-5)" fill="var(--chart-5)" fillOpacity={0.3} />
              <Area type="monotone" dataKey="lowSocial" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.3} />
              <Area type="monotone" dataKey="medSocial" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.3} />
              <Area type="monotone" dataKey="highSocial" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.3} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Social connectedness creates diverging trajectories over time
        </CardFooter>
      </Card>

      {/* Visualization 5: Network Density Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Network Density vs Collective Impact</CardTitle>
          <CardDescription>
            Community-level sustainability improvement by network density
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              collectiveImpact: { label: "Collective Impact Score", color: "var(--chart-1)" },
            }}
            className="h-[300px]"
          >
            <LineChart data={networkDensityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="density" tick={{ fontSize: 11 }} label={{ value: "Network Density", position: "insideBottom", offset: -5 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: "Collective Impact", angle: -90, position: "insideLeft" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="collectiveImpact" stroke="var(--chart-1)" strokeWidth={3} dot={{ fill: "var(--chart-1)", r: 5 }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Denser social networks amplify collective sustainability impact
        </CardFooter>
      </Card>
    </div>
  );
}
