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
  Area,
  AreaChart,
  ComposedChart,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts";

// Research Questions:
// 1. Which features contribute to biggest change in sustainability?
// 2. Which types of food practices are easiest to change?
// Note: All users have access to all platform features (recipes, shopping lists, waste tracker, games, maps, social feed, challenges)
// Analysis compares users by their engagement patterns with different features

// Feature engagement vs sustainability improvement
const featureImpactData = [
  { feature: "Recipes", users: 1250, sustainabilityChange: 18.5, avgEngagement: 4.2 },
  { feature: "Shopping Lists", users: 980, sustainabilityChange: 22.3, avgEngagement: 5.1 },
  { feature: "Waste Tracker", users: 850, sustainabilityChange: 25.8, avgEngagement: 3.8 },
  { feature: "Games", users: 1420, sustainabilityChange: 12.4, avgEngagement: 6.5 },
  { feature: "Maps", users: 720, sustainabilityChange: 8.2, avgEngagement: 2.3 },
  { feature: "Social Feed", users: 1100, sustainabilityChange: 15.7, avgEngagement: 4.8 },
  { feature: "Challenges", users: 890, sustainabilityChange: 20.1, avgEngagement: 5.4 },
];

// Food practice change difficulty
const practiceChangeData = [
  { practice: "Reduce Meat", changeRate: 68, difficulty: 3.2, avgTime: 45 },
  { practice: "Buy Local", changeRate: 82, difficulty: 2.1, avgTime: 28 },
  { practice: "Reduce Waste", changeRate: 75, difficulty: 2.5, avgTime: 35 },
  { practice: "Meal Planning", changeRate: 71, difficulty: 2.8, avgTime: 42 },
  { practice: "Seasonal Foods", changeRate: 79, difficulty: 2.3, avgTime: 30 },
  { practice: "Plant-based Days", changeRate: 64, difficulty: 3.5, avgTime: 52 },
  { practice: "Composting", changeRate: 58, difficulty: 3.8, avgTime: 60 },
];

// Sustainability score over time by feature usage
const timeSeriesData = [
  { week: "Week 1", recipes: 45, shopping: 42, waste: 40, games: 48, social: 44 },
  { week: "Week 2", recipes: 48, shopping: 46, waste: 44, games: 50, social: 46 },
  { week: "Week 3", recipes: 52, shopping: 51, waste: 49, games: 52, social: 49 },
  { week: "Week 4", recipes: 56, shopping: 56, waste: 55, games: 53, social: 52 },
  { week: "Week 5", recipes: 60, shopping: 62, waste: 62, games: 54, social: 55 },
  { week: "Week 6", recipes: 63, shopping: 68, waste: 70, games: 55, social: 58 },
  { week: "Week 7", recipes: 66, shopping: 73, waste: 77, games: 56, social: 61 },
  { week: "Week 8", recipes: 68, shopping: 77, waste: 83, games: 57, social: 64 },
];

// Combined feature usage patterns
const combinedFeaturesData = [
  { combination: "Waste + Shopping", users: 420, impact: 32.5 },
  { combination: "Recipes + Shopping", users: 380, impact: 28.2 },
  { combination: "Social + Challenges", users: 350, impact: 26.8 },
  { combination: "Waste + Recipes", users: 290, impact: 24.1 },
  { combination: "All Features", users: 180, impact: 38.7 },
  { combination: "Games Only", users: 520, impact: 11.2 },
];

// Behavior change by practice type over time
const practiceProgressData = [
  { month: "Month 1", diet: 15, purchasing: 22, waste: 28, planning: 18 },
  { month: "Month 2", diet: 28, purchasing: 38, waste: 45, planning: 32 },
  { month: "Month 3", diet: 38, purchasing: 52, waste: 58, planning: 44 },
  { month: "Month 4", diet: 46, purchasing: 63, waste: 68, planning: 54 },
  { month: "Month 5", diet: 52, purchasing: 71, waste: 75, planning: 62 },
  { month: "Month 6", diet: 58, purchasing: 78, waste: 82, planning: 68 },
];

export function BehaviorChangeContent() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Behavior Change Analysis</h2>
          <p className="text-muted-foreground">
            Feature effectiveness and practice change patterns
          </p>
        </div>
      </div>

      {/* Visualization 1: Feature Impact on Sustainability */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Feature Impact on Sustainability</CardTitle>
          <CardDescription>
            Sustainability score improvement (%) by feature usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              sustainabilityChange: { label: "Sustainability Improvement", color: "var(--chart-1)" },
              users: { label: "Active Users", color: "var(--chart-2)" },
            }}
            className="h-[350px]"
          >
            <ComposedChart data={featureImpactData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="feature" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: "% Improvement", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: "Users", angle: 90, position: "insideRight" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar yAxisId="left" dataKey="sustainabilityChange" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="users" stroke="var(--chart-2)" strokeWidth={2} />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Waste Tracker and Shopping Lists show highest sustainability impact despite lower user counts
        </CardFooter>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Visualization 2: Practice Change Difficulty */}
        <Card>
          <CardHeader>
            <CardTitle>Food Practice Change Rates</CardTitle>
            <CardDescription>
              Success rate by practice type (% of users maintaining change)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                changeRate: { label: "Success Rate", color: "var(--chart-3)" },
              }}
              className="h-[350px]"
            >
              <BarChart data={practiceChangeData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="practice" type="category" width={120} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="changeRate" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Purchasing behaviors easier to change than dietary habits
          </CardFooter>
        </Card>

        {/* Visualization 3: Combined Feature Usage Impact */}
        <Card>
          <CardHeader>
            <CardTitle>Combined Feature Usage Impact</CardTitle>
            <CardDescription>
              Sustainability improvement by feature combinations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                impact: { label: "Impact Score", color: "var(--chart-4)" },
              }}
              className="h-[350px]"
            >
              <BarChart data={combinedFeaturesData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="combination" type="category" width={140} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="impact" fill="var(--chart-4)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Multi-feature users show significantly higher impact
          </CardFooter>
        </Card>
      </div>

      {/* Visualization 4: Sustainability Progress by Feature */}
      <Card>
        <CardHeader>
          <CardTitle>Sustainability Score Progression by Feature</CardTitle>
          <CardDescription>
            8-week sustainability score trajectory by primary feature used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              recipes: { label: "Recipes", color: "var(--chart-1)" },
              shopping: { label: "Shopping Lists", color: "var(--chart-2)" },
              waste: { label: "Waste Tracker", color: "var(--chart-3)" },
              games: { label: "Games", color: "var(--chart-4)" },
              social: { label: "Social Feed", color: "var(--chart-5)" },
            }}
            className="h-[350px]"
          >
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[35, 90]} label={{ value: "Sustainability Score", angle: -90, position: "insideLeft" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey="recipes" stroke="var(--chart-1)" strokeWidth={2} />
              <Line type="monotone" dataKey="shopping" stroke="var(--chart-2)" strokeWidth={2} />
              <Line type="monotone" dataKey="waste" stroke="var(--chart-3)" strokeWidth={2} />
              <Line type="monotone" dataKey="games" stroke="var(--chart-4)" strokeWidth={2} />
              <Line type="monotone" dataKey="social" stroke="var(--chart-5)" strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Waste Tracker users show steepest improvement curve over time
        </CardFooter>
      </Card>

      {/* Visualization 5: Practice Type Change Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Behavior Change by Practice Type</CardTitle>
          <CardDescription>
            Adoption rate (%) over 6 months by food practice category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              diet: { label: "Dietary Changes", color: "var(--chart-1)" },
              purchasing: { label: "Purchasing Behavior", color: "var(--chart-2)" },
              waste: { label: "Waste Reduction", color: "var(--chart-3)" },
              planning: { label: "Meal Planning", color: "var(--chart-4)" },
            }}
            className="h-[350px]"
          >
            <AreaChart data={practiceProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: "Adoption Rate (%)", angle: -90, position: "insideLeft" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area type="monotone" dataKey="diet" stackId="1" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.6} />
              <Area type="monotone" dataKey="purchasing" stackId="1" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.6} />
              <Area type="monotone" dataKey="waste" stackId="1" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.6} />
              <Area type="monotone" dataKey="planning" stackId="1" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.6} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Waste reduction shows fastest adoption, dietary changes slowest but steady
        </CardFooter>
      </Card>
    </div>
  );
}
