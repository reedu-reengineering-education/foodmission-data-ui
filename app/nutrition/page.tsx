"use client"

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
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardHeader, CardDescription, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, Bar, BarChart, Area, AreaChart, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell, Pie, PieChart } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Apple, Heart, TrendingUp, Activity, AlertCircle, CheckCircle } from "lucide-react";

// Mock nutrition and health data
const nutritionalQualityData = [
    { month: "Jan", score: 72, fruits: 68, vegetables: 75, proteins: 73, grains: 70 },
    { month: "Feb", score: 74, fruits: 70, vegetables: 77, proteins: 75, grains: 72 },
    { month: "Mar", score: 76, fruits: 73, vegetables: 78, proteins: 76, grains: 75 },
    { month: "Apr", score: 78, fruits: 75, vegetables: 80, proteins: 78, grains: 77 },
    { month: "May", score: 80, fruits: 78, vegetables: 82, proteins: 80, grains: 79 },
    { month: "Jun", score: 82, fruits: 80, vegetables: 84, proteins: 82, grains: 81 },
];

const dietaryPatternsData = [
    { pattern: "Mediterranean", adoption: 42, health_score: 88 },
    { pattern: "Plant-Based", adoption: 28, health_score: 85 },
    { pattern: "Balanced", adoption: 55, health_score: 80 },
    { pattern: "Traditional", adoption: 38, health_score: 75 },
];

const macronutrientsData = [
    { category: "Proteins", value: 28, color: "var(--chart-1)" },
    { category: "Carbohydrates", value: 45, color: "var(--chart-2)" },
    { category: "Fats", value: 22, color: "var(--chart-3)" },
    { category: "Fiber", value: 5, color: "var(--chart-4)" },
];

const micronutrientsData = [
    { nutrient: "Vitamin A", adequacy: 92 },
    { nutrient: "Vitamin C", adequacy: 88 },
    { nutrient: "Vitamin D", adequacy: 76 },
    { nutrient: "Iron", adequacy: 84 },
    { nutrient: "Calcium", adequacy: 82 },
    { nutrient: "Omega-3", adequacy: 78 },
];

const healthIndicatorsData = [
    { indicator: "Obesity Rate", value: 18.2, target: 15, trend: "decreasing" },
    { indicator: "Diabetes Prevalence", value: 6.8, target: 6, trend: "stable" },
    { indicator: "Heart Disease", value: 8.5, target: 7, trend: "decreasing" },
    { indicator: "Nutritional Deficiency", value: 4.2, target: 3, trend: "decreasing" },
];

const foodConsumptionData = [
    { category: "Fruits", recommended: 400, actual: 358, unit: "g/day" },
    { category: "Vegetables", recommended: 400, actual: 382, unit: "g/day" },
    { category: "Whole Grains", recommended: 250, actual: 245, unit: "g/day" },
    { category: "Legumes", recommended: 100, actual: 78, unit: "g/day" },
    { category: "Nuts", recommended: 30, actual: 25, unit: "g/day" },
    { category: "Fish", recommended: 150, actual: 142, unit: "g/week" },
];

const ageGroupNutrition = [
    { age: "0-5", adequacy: 85, concerns: 2 },
    { age: "6-12", adequacy: 82, concerns: 3 },
    { age: "13-18", adequacy: 76, concerns: 5 },
    { age: "19-35", adequacy: 78, concerns: 4 },
    { age: "36-55", adequacy: 80, concerns: 3 },
    { age: "56+", adequacy: 88, concerns: 2 },
];

const nutritionRadarData = [
    { category: "Caloric Balance", score: 82, fullMark: 100 },
    { category: "Protein Quality", score: 88, fullMark: 100 },
    { category: "Vitamin Intake", score: 85, fullMark: 100 },
    { category: "Mineral Balance", score: 78, fullMark: 100 },
    { category: "Hydration", score: 90, fullMark: 100 },
    { category: "Fiber Intake", score: 75, fullMark: 100 },
];

const seasonalAvailability = [
    { month: "Jan", fresh: 45, preserved: 55, local: 38 },
    { month: "Feb", fresh: 48, preserved: 52, local: 42 },
    { month: "Mar", fresh: 55, preserved: 45, local: 50 },
    { month: "Apr", fresh: 68, preserved: 32, local: 62 },
    { month: "May", fresh: 78, preserved: 22, local: 72 },
    { month: "Jun", fresh: 85, preserved: 15, local: 80 },
];

export default function NutritionPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            const session = await authClient.getSession();
            if (!session.data) {
                router.push("/sign-in");
            } else {
                setIsLoading(false);
            }
        }
        checkAuth();
    }, [router]);

    if (isLoading) {
        return null;
    }

    return (
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/">FoodMission Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Nutrition & Health</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Nutrition & Health Analytics</h2>
                            <p className="text-muted-foreground">
                                Comprehensive nutritional quality and public health monitoring
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                                <Heart className="h-3 w-3" />
                                Good Health Score
                            </Badge>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Nutrition Score</CardDescription>
                                <Apple className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">82/100</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">+8 points</span> this quarter
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Dietary Adequacy</CardDescription>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">85%</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">+4%</span> improvement
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Health Indicators</CardDescription>
                                <Activity className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Improving</div>
                                <p className="text-xs text-muted-foreground">
                                    3 of 4 trending positive
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>At-Risk Population</CardDescription>
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">8.2%</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">-2.1%</span> decrease
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Nutritional Quality & Radar */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Nutritional Quality Trends</CardTitle>
                                <CardDescription>6-month evolution of nutritional scores by category</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        score: {
                                            label: "Overall Score",
                                            color: "var(--chart-1)",
                                        },
                                        fruits: {
                                            label: "Fruits",
                                            color: "var(--chart-2)",
                                        },
                                        vegetables: {
                                            label: "Vegetables",
                                            color: "var(--chart-3)",
                                        },
                                        proteins: {
                                            label: "Proteins",
                                            color: "var(--chart-4)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <LineChart data={nutritionalQualityData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis domain={[60, 90]} tick={{ fontSize: 11 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Line
                                            type="monotone"
                                            dataKey="score"
                                            stroke="var(--chart-1)"
                                            strokeWidth={3}
                                            dot={{ fill: "var(--chart-1)" }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="fruits"
                                            stroke="var(--chart-2)"
                                            strokeWidth={2}
                                            dot={{ fill: "var(--chart-2)" }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="vegetables"
                                            stroke="var(--chart-3)"
                                            strokeWidth={2}
                                            dot={{ fill: "var(--chart-3)" }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="proteins"
                                            stroke="var(--chart-4)"
                                            strokeWidth={2}
                                            dot={{ fill: "var(--chart-4)" }}
                                        />
                                    </LineChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                All nutritional categories showing positive upward trends
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Nutritional Balance Assessment</CardTitle>
                                <CardDescription>Multi-dimensional dietary quality evaluation</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        score: {
                                            label: "Score",
                                            color: "var(--chart-2)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <RadarChart data={nutritionRadarData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="category" tick={{ fontSize: 9 }} />
                                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                                        <Radar
                                            name="Score"
                                            dataKey="score"
                                            stroke="var(--chart-2)"
                                            fill="var(--chart-2)"
                                            fillOpacity={0.6}
                                        />
                                    </RadarChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Hydration and protein quality showing excellent performance
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Macronutrients & Dietary Patterns */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Macronutrient Distribution</CardTitle>
                                <CardDescription>Average daily intake composition (%)</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <ChartContainer
                                    config={{
                                        proteins: {
                                            label: "Proteins",
                                            color: "var(--chart-1)",
                                        },
                                        carbs: {
                                            label: "Carbohydrates",
                                            color: "var(--chart-2)",
                                        },
                                        fats: {
                                            label: "Fats",
                                            color: "var(--chart-3)",
                                        },
                                        fiber: {
                                            label: "Fiber",
                                            color: "var(--chart-4)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <PieChart>
                                        <Pie
                                            data={macronutrientsData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ category, value }) => `${category}: ${value}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {macronutrientsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Well-balanced macronutrient distribution within WHO guidelines
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Dietary Pattern Adoption</CardTitle>
                                <CardDescription>Population adoption (%) and health scores</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        adoption: {
                                            label: "Adoption %",
                                            color: "var(--chart-3)",
                                        },
                                        health_score: {
                                            label: "Health Score",
                                            color: "var(--chart-4)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <BarChart data={dietaryPatternsData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="pattern"
                                            tick={{ fontSize: 10 }}
                                            angle={-15}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar
                                            yAxisId="left"
                                            dataKey="adoption"
                                            fill="var(--chart-3)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="health_score"
                                            stroke="var(--chart-4)"
                                            strokeWidth={2}
                                            dot={{ fill: "var(--chart-4)" }}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Mediterranean diet shows highest health scores
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Food Consumption & Micronutrients */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Food Consumption vs Recommendations</CardTitle>
                                <CardDescription>Daily/weekly intake compared to recommended amounts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        recommended: {
                                            label: "Recommended",
                                            color: "var(--chart-1)",
                                        },
                                        actual: {
                                            label: "Actual",
                                            color: "var(--chart-2)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <BarChart data={foodConsumptionData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" tick={{ fontSize: 11 }} />
                                        <YAxis dataKey="category" type="category" width={100} tick={{ fontSize: 10 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="recommended" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="actual" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Most categories meeting 85%+ of recommended intake
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Micronutrient Adequacy</CardTitle>
                                <CardDescription>Population meeting daily requirements (%)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        adequacy: {
                                            label: "Adequacy %",
                                            color: "var(--chart-3)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <BarChart data={micronutrientsData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="nutrient"
                                            tick={{ fontSize: 10 }}
                                            angle={-15}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="adequacy" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Vitamin D showing lowest adequacy - requires targeted intervention
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Age Group Nutrition & Seasonal Availability */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Nutrition Adequacy by Age Group</CardTitle>
                                <CardDescription>Dietary adequacy scores and concern areas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        adequacy: {
                                            label: "Adequacy Score",
                                            color: "var(--chart-4)",
                                        },
                                        concerns: {
                                            label: "Concern Areas",
                                            color: "var(--chart-3)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <BarChart data={ageGroupNutrition}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="age" tick={{ fontSize: 11 }} />
                                        <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                                        <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={{ fontSize: 11 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar
                                            yAxisId="left"
                                            dataKey="adequacy"
                                            fill="var(--chart-4)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            yAxisId="right"
                                            dataKey="concerns"
                                            fill="var(--chart-3)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Adolescents (13-18) require additional nutritional support
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Seasonal Food Availability</CardTitle>
                                <CardDescription>Fresh vs preserved food availability and local sourcing (%)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        fresh: {
                                            label: "Fresh",
                                            color: "var(--chart-2)",
                                        },
                                        local: {
                                            label: "Local",
                                            color: "var(--chart-4)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <AreaChart data={seasonalAvailability}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area
                                            type="monotone"
                                            dataKey="fresh"
                                            stroke="var(--chart-2)"
                                            fill="var(--chart-2)"
                                            fillOpacity={0.6}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="local"
                                            stroke="var(--chart-4)"
                                            fill="var(--chart-4)"
                                            fillOpacity={0.4}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Peak fresh and local availability in summer months (May-June)
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
    );
}
