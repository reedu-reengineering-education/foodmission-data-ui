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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
  Pie,
  PieChart,
} from "recharts";

// Research Question: Baseline dietary differences in different countries

// 1. Dietary composition by country (macronutrients)
const dietaryCompositionData = [
  { country: "Norway", protein: 18, carbs: 45, fat: 37, fiber: 25 },
  { country: "Netherlands", protein: 16, carbs: 48, fat: 36, fiber: 28 },
  { country: "Germany", protein: 17, carbs: 46, fat: 37, fiber: 24 },
  { country: "Poland", protein: 19, carbs: 52, fat: 29, fiber: 22 },
  { country: "Spain", protein: 15, carbs: 50, fat: 35, fiber: 30 },
  { country: "Italy", protein: 14, carbs: 51, fat: 35, fiber: 32 },
  { country: "Slovenia", protein: 16, carbs: 49, fat: 35, fiber: 26 },
  { country: "Greece", protein: 15, carbs: 48, fat: 37, fiber: 29 },
];

// 2. Food group consumption patterns
const foodGroupData = [
  { country: "Norway", meat: 85, dairy: 92, grains: 78, vegetables: 65, fruits: 58, legumes: 42 },
  { country: "Netherlands", meat: 78, dairy: 88, grains: 82, vegetables: 72, fruits: 68, legumes: 55 },
  { country: "Germany", meat: 82, dairy: 85, grains: 80, vegetables: 68, fruits: 62, legumes: 48 },
  { country: "Poland", meat: 88, dairy: 90, grains: 85, vegetables: 60, fruits: 55, legumes: 38 },
  { country: "Spain", meat: 72, dairy: 75, grains: 76, vegetables: 85, fruits: 88, legumes: 68 },
  { country: "Italy", meat: 70, dairy: 78, grains: 74, vegetables: 88, fruits: 90, legumes: 72 },
  { country: "Slovenia", meat: 80, dairy: 82, grains: 79, vegetables: 70, fruits: 65, legumes: 52 },
  { country: "Greece", meat: 68, dairy: 80, grains: 72, vegetables: 90, fruits: 85, legumes: 75 },
];

// 3. Carbon footprint by dietary pattern
const carbonFootprintData = [
  { country: "Norway", baseline: 2.8, current: 2.5 },
  { country: "Netherlands", baseline: 2.4, current: 2.1 },
  { country: "Germany", baseline: 2.6, current: 2.3 },
  { country: "Poland", baseline: 3.1, current: 2.9 },
  { country: "Spain", baseline: 2.2, current: 1.9 },
  { country: "Italy", baseline: 2.1, current: 1.8 },
  { country: "Slovenia", baseline: 2.5, current: 2.2 },
  { country: "Greece", baseline: 2.0, current: 1.7 },
];

// 4. Dietary diversity index
const diversityData = [
  { country: "Norway", score: 6.8 },
  { country: "Netherlands", score: 7.2 },
  { country: "Germany", score: 7.0 },
  { country: "Poland", score: 6.5 },
  { country: "Spain", score: 8.1 },
  { country: "Italy", score: 8.3 },
  { country: "Slovenia", score: 7.1 },
  { country: "Greece", score: 8.0 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

export function DietaryBaselineContent() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dietary Baseline Analysis</h2>
          <p className="text-muted-foreground">
            Baseline dietary differences across countries
          </p>
        </div>
      </div>

      {/* Visualization 1: Macronutrient Distribution by Country */}
      <Card>
        <CardHeader>
          <CardTitle>Macronutrient Distribution by Country</CardTitle>
          <CardDescription>
            Baseline protein, carbohydrate, and fat intake (% of total calories)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              protein: { label: "Protein", color: "var(--chart-1)" },
              carbs: { label: "Carbohydrates", color: "var(--chart-2)" },
              fat: { label: "Fat", color: "var(--chart-3)" },
            }}
            className="h-[350px]"
          >
            <BarChart data={dietaryCompositionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: "% of calories", angle: -90, position: "insideLeft" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="protein" fill="var(--chart-1)" stackId="a" />
              <Bar dataKey="carbs" fill="var(--chart-2)" stackId="a" />
              <Bar dataKey="fat" fill="var(--chart-3)" stackId="a" />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Mediterranean countries show higher carbohydrate intake, Northern Europe higher protein
        </CardFooter>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Visualization 2: Food Group Consumption Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Food Group Consumption Patterns</CardTitle>
            <CardDescription>
              Consumption index by food category (select countries)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                norway: { label: "Norway", color: "var(--chart-1)" },
                spain: { label: "Spain", color: "var(--chart-2)" },
                poland: { label: "Poland", color: "var(--chart-3)" },
              }}
              className="h-[350px]"
            >
              <RadarChart data={[
                { category: "Meat", norway: 85, spain: 72, poland: 88 },
                { category: "Dairy", norway: 92, spain: 75, poland: 90 },
                { category: "Grains", norway: 78, spain: 76, poland: 85 },
                { category: "Vegetables", norway: 65, spain: 85, poland: 60 },
                { category: "Fruits", norway: 58, spain: 88, poland: 55 },
                { category: "Legumes", norway: 42, spain: 68, poland: 38 },
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Norway" dataKey="norway" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.3} />
                <Radar name="Spain" dataKey="spain" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.3} />
                <Radar name="Poland" dataKey="poland" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.3} />
                <ChartLegend content={<ChartLegendContent />} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Mediterranean diets show higher plant-based food consumption
          </CardFooter>
        </Card>

        {/* Visualization 3: Carbon Footprint Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Dietary Carbon Footprint</CardTitle>
            <CardDescription>
              Baseline vs current CO₂ emissions (kg CO₂e per day)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                baseline: { label: "Baseline", color: "var(--chart-4)" },
                current: { label: "Current", color: "var(--chart-5)" },
              }}
              className="h-[350px]"
            >
              <BarChart data={carbonFootprintData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 11 }} label={{ value: "kg CO₂e/day", angle: -90, position: "insideLeft" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="baseline" fill="var(--chart-4)" />
                <Bar dataKey="current" fill="var(--chart-5)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            All countries show reduction in dietary carbon footprint
          </CardFooter>
        </Card>
      </div>

      {/* Visualization 4: Dietary Diversity Index */}
      <Card>
        <CardHeader>
          <CardTitle>Dietary Diversity Index</CardTitle>
          <CardDescription>
            Baseline dietary diversity score (0-10 scale, higher is better)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              score: { label: "Diversity Score", color: "var(--chart-1)" },
            }}
            className="h-[300px]"
          >
            <BarChart data={diversityData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} />
              <YAxis dataKey="country" type="category" width={100} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="score" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Mediterranean countries demonstrate higher dietary diversity at baseline
        </CardFooter>
      </Card>
    </div>
  );
}
