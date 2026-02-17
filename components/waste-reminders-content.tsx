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
} from "recharts";

// Research Questions:
// 1. Does waste tracking module usage influence shopping decisions?
// 2. Effectiveness of platform for estimating food waste
// Note: All users have access to all modules (knowledge, challenges, missions, waste tracking)
// Analysis compares users by their engagement level with different modules

// Shopping behavior by waste tracking engagement
const shoppingBehaviorData = [
  { category: "Impulse Buys", highTracking: 3.2, lowTracking: 5.8 },
  { category: "Overbuying", highTracking: 2.8, lowTracking: 4.9 },
  { category: "List Adherence", highTracking: 82, lowTracking: 58 },
  { category: "Portion Planning", highTracking: 76, lowTracking: 45 },
  { category: "Expiry Awareness", highTracking: 88, lowTracking: 52 },
];

// Waste reduction over time by module usage
const wasteReductionTimeData = [
  { week: "Week 1", highEngagement: 100, mediumEngagement: 100, lowEngagement: 100 },
  { week: "Week 2", highEngagement: 92, mediumEngagement: 96, lowEngagement: 99 },
  { week: "Week 3", highEngagement: 82, mediumEngagement: 91, lowEngagement: 97 },
  { week: "Week 4", highEngagement: 71, mediumEngagement: 86, lowEngagement: 95 },
  { week: "Week 5", highEngagement: 62, mediumEngagement: 82, lowEngagement: 93 },
  { week: "Week 6", highEngagement: 54, mediumEngagement: 78, lowEngagement: 91 },
  { week: "Week 7", highEngagement: 48, mediumEngagement: 75, lowEngagement: 90 },
  { week: "Week 8", highEngagement: 43, mediumEngagement: 72, lowEngagement: 89 },
];

// Waste estimation accuracy
const estimationAccuracyData = [
  { method: "Self-Report Only", accuracy: 52, users: 320 },
  { method: "Photo Upload", accuracy: 68, users: 280 },
  { method: "Weight Tracking", accuracy: 85, users: 180 },
  { method: "AI Estimation", accuracy: 78, users: 420 },
  { method: "Combined Method", accuracy: 92, users: 150 },
];

// Module usage impact on waste reduction
const moduleUsageData = [
  { module: "Knowledge Only", wasteReduction: 15, engagement: 42 },
  { module: "Challenges", wasteReduction: 28, engagement: 68 },
  { module: "Missions", wasteReduction: 32, engagement: 75 },
  { module: "Knowledge + Challenges", wasteReduction: 38, engagement: 82 },
  { module: "All Modules", wasteReduction: 45, engagement: 88 },
];

// Waste category tracking effectiveness
const wasteCategoryData = [
  { category: "Fruits & Veg", estimated: 245, actual: 268, reduction: 42 },
  { category: "Dairy", estimated: 128, actual: 115, reduction: 38 },
  { category: "Meat & Fish", estimated: 95, actual: 102, reduction: 52 },
  { category: "Bread & Grains", estimated: 156, actual: 148, reduction: 35 },
  { category: "Prepared Foods", estimated: 188, actual: 195, reduction: 28 },
];

// Behavioral response to waste tracking
const behavioralResponseData = [
  { response: "Adjusted Shopping", percentage: 78 },
  { response: "Meal Planning", percentage: 72 },
  { response: "Portion Control", percentage: 65 },
  { response: "Storage Improvement", percentage: 58 },
  { response: "Recipe Adaptation", percentage: 52 },
  { response: "Sharing/Donating", percentage: 45 },
  { response: "Composting", percentage: 38 },
];

export function WasteTrackingContent() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Waste Tracking Analysis</h2>
          <p className="text-muted-foreground">
            Impact of waste tracking module usage on behavior and estimation effectiveness
          </p>
        </div>
      </div>

      {/* Visualization 1: Shopping Behavior Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Shopping Behavior by Waste Tracking Engagement</CardTitle>
          <CardDescription>
            Comparison of shopping metrics by waste tracking module usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              highTracking: { label: "High Tracking Engagement", color: "var(--chart-1)" },
              lowTracking: { label: "Low Tracking Engagement", color: "var(--chart-5)" },
            }}
            className="h-[350px]"
          >
            <BarChart data={shoppingBehaviorData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="category" type="category" width={130} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="highTracking" fill="var(--chart-1)" />
              <Bar dataKey="lowTracking" fill="var(--chart-5)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Active waste tracking correlates with improved shopping discipline and planning
        </CardFooter>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Visualization 2: Waste Reduction Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Waste Reduction Trajectory</CardTitle>
            <CardDescription>
              8-week waste levels (baseline = 100) by platform engagement level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                highEngagement: { label: "High Engagement (3+ modules)", color: "var(--chart-1)" },
                mediumEngagement: { label: "Medium Engagement (2 modules)", color: "var(--chart-2)" },
                lowEngagement: { label: "Low Engagement (1 module)", color: "var(--chart-5)" },
              }}
              className="h-[350px]"
            >
              <LineChart data={wasteReductionTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[40, 105]} label={{ value: "Waste Index", angle: -90, position: "insideLeft" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="highEngagement" stroke="var(--chart-1)" strokeWidth={3} />
                <Line type="monotone" dataKey="mediumEngagement" stroke="var(--chart-2)" strokeWidth={2} />
                <Line type="monotone" dataKey="lowEngagement" stroke="var(--chart-5)" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            High engagement users achieve 57% waste reduction vs 11% for low engagement
          </CardFooter>
        </Card>

        {/* Visualization 3: Module Usage Impact */}
        <Card>
          <CardHeader>
            <CardTitle>Module Usage Effectiveness</CardTitle>
            <CardDescription>
              Waste reduction and engagement by module combination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                wasteReduction: { label: "Waste Reduction (%)", color: "var(--chart-3)" },
                engagement: { label: "Engagement Score", color: "var(--chart-4)" },
              }}
              className="h-[350px]"
            >
              <ComposedChart data={moduleUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="module" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="wasteReduction" fill="var(--chart-3)" />
                <Line type="monotone" dataKey="engagement" stroke="var(--chart-4)" strokeWidth={3} />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Combined module usage shows highest waste reduction impact
          </CardFooter>
        </Card>
      </div>

      {/* Visualization 4: Waste Estimation Accuracy */}
      <Card>
        <CardHeader>
          <CardTitle>Waste Estimation Method Accuracy</CardTitle>
          <CardDescription>
            Platform effectiveness for estimating food waste by tracking method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              accuracy: { label: "Accuracy (%)", color: "var(--chart-1)" },
              users: { label: "Active Users", color: "var(--chart-2)" },
            }}
            className="h-[350px]"
          >
            <ComposedChart data={estimationAccuracyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="method" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: "Accuracy (%)", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: "Users", angle: 90, position: "insideRight" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar yAxisId="left" dataKey="accuracy" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="users" stroke="var(--chart-2)" strokeWidth={2} />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Combined methods achieve 92% accuracy; AI estimation balances accuracy and adoption
        </CardFooter>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Visualization 5: Waste by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Waste Tracking by Food Category</CardTitle>
            <CardDescription>
              Estimated vs actual waste and reduction achieved (kg/month)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                estimated: { label: "Estimated", color: "var(--chart-4)" },
                actual: { label: "Actual", color: "var(--chart-5)" },
                reduction: { label: "Reduction (%)", color: "var(--chart-1)" },
              }}
              className="h-[350px]"
            >
              <BarChart data={wasteCategoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="estimated" fill="var(--chart-4)" />
                <Bar dataKey="actual" fill="var(--chart-5)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Platform estimates within 10% accuracy across categories
          </CardFooter>
        </Card>

        {/* Visualization 6: Behavioral Response */}
        <Card>
          <CardHeader>
            <CardTitle>Behavioral Changes from Waste Tracking</CardTitle>
            <CardDescription>
              Actions taken by users actively tracking waste (%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                percentage: { label: "Users Taking Action", color: "var(--chart-3)" },
              }}
              className="h-[350px]"
            >
              <BarChart data={behavioralResponseData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="response" type="category" width={140} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="percentage" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Waste tracking users report multiple behavior changes
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
