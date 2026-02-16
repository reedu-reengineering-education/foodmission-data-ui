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
import { Area, AreaChart, Bar, BarChart, Pie, PieChart, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";

// Mock regional data
const regionsData = [
    { region: "Northern Europe", production: 28500, population: 27.5, efficiency: 89 },
    { region: "Western Europe", production: 42300, population: 63.2, efficiency: 92 },
    { region: "Southern Europe", production: 51200, population: 75.8, efficiency: 85 },
    { region: "Central Europe", production: 34800, population: 48.3, efficiency: 88 },
    { region: "Eastern Europe", production: 25600, population: 42.1, efficiency: 82 },
];

const countryComparison = [
    { country: "Germany", production: 12400, consumption: 11800, export: 600, import: 200 },
    { country: "Spain", production: 15200, consumption: 13500, export: 1700, import: 0 },
    { country: "Italy", production: 14800, consumption: 13200, export: 1600, import: 0 },
    { country: "Netherlands", production: 8500, consumption: 7200, export: 1300, import: 0 },
    { country: "Poland", production: 6800, consumption: 6500, export: 300, import: 0 },
];

const urbanRuralData = [
    { type: "Urban", value: 45, color: "var(--chart-1)" },
    { type: "Suburban", value: 30, color: "var(--chart-2)" },
    { type: "Rural", value: 25, color: "var(--chart-3)" },
];

const regionalSustainability = [
    { category: "Production", northern: 85, western: 92, southern: 78, central: 88, eastern: 75 },
    { category: "Distribution", northern: 88, western: 89, southern: 82, central: 85, eastern: 78 },
    { category: "Waste Mgmt", northern: 90, western: 94, southern: 76, central: 83, eastern: 72 },
    { category: "Innovation", northern: 92, western: 95, southern: 80, central: 86, eastern: 74 },
    { category: "Local Food", northern: 78, western: 82, southern: 88, central: 84, eastern: 86 },
];

const regionalRadarData = [
    { subject: "Production", A: 92, fullMark: 100 },
    { subject: "Sustainability", A: 85, fullMark: 100 },
    { subject: "Distribution", A: 88, fullMark: 100 },
    { subject: "Innovation", A: 78, fullMark: 100 },
    { subject: "Efficiency", A: 90, fullMark: 100 },
    { subject: "Quality", A: 87, fullMark: 100 },
];

// Country comparison radar data - comparing partner countries across key metrics
const countryRadarComparison = [
    {
        category: "Production Capacity",
        Germany: 88,
        Spain: 92,
        Italy: 90,
        Netherlands: 85,
        Poland: 78,
        Norway: 82,
        fullMark: 100
    },
    {
        category: "Sustainability",
        Germany: 91,
        Spain: 76,
        Italy: 80,
        Netherlands: 93,
        Poland: 72,
        Norway: 95,
        fullMark: 100
    },
    {
        category: "Innovation",
        Germany: 94,
        Spain: 78,
        Italy: 82,
        Netherlands: 96,
        Poland: 68,
        Norway: 92,
        fullMark: 100
    },
    {
        category: "Food Quality",
        Germany: 90,
        Spain: 88,
        Italy: 95,
        Netherlands: 88,
        Poland: 80,
        Norway: 90,
        fullMark: 100
    },
    {
        category: "Distribution Efficiency",
        Germany: 92,
        Spain: 82,
        Italy: 85,
        Netherlands: 94,
        Poland: 75,
        Norway: 88,
        fullMark: 100
    },
    {
        category: "Local Sourcing",
        Germany: 80,
        Spain: 90,
        Italy: 92,
        Netherlands: 75,
        Poland: 88,
        Norway: 85,
        fullMark: 100
    },
];

// Mediterranean vs Northern countries comparison
const mediterraneanVsNorthern = [
    { category: "Production", Mediterranean: 91, Northern: 85, fullMark: 100 },
    { category: "Sustainability", Mediterranean: 78, Northern: 94, fullMark: 100 },
    { category: "Innovation", Mediterranean: 80, Northern: 93, fullMark: 100 },
    { category: "Local Food", Mediterranean: 92, Northern: 81, fullMark: 100 },
    { category: "Organic Farming", Mediterranean: 85, Northern: 88, fullMark: 100 },
    { category: "Technology Use", Mediterranean: 75, Northern: 92, fullMark: 100 },
];

// Top 4 producers detailed comparison
const top4ProducersRadar = [
    { category: "Volume", Spain: 95, Italy: 92, Germany: 88, Netherlands: 70, fullMark: 100 },
    { category: "Quality", Spain: 86, Italy: 94, Germany: 90, Netherlands: 88, fullMark: 100 },
    { category: "Export", Spain: 90, Italy: 88, Germany: 82, Netherlands: 95, fullMark: 100 },
    { category: "Sustainability", Spain: 76, Italy: 80, Germany: 91, Netherlands: 93, fullMark: 100 },
    { category: "Innovation", Spain: 78, Italy: 82, Germany: 94, Netherlands: 96, fullMark: 100 },
    { category: "Diversity", Spain: 92, Italy: 95, Germany: 85, Netherlands: 78, fullMark: 100 },
];

export default function RegionalPage() {
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
                                    <BreadcrumbPage>Regional Analysis</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Regional Analysis</h2>
                            <p className="text-muted-foreground">
                                Comprehensive food system analysis across European regions
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline">8 Countries</Badge>
                            <Badge variant="outline">5 Regions</Badge>
                        </div>
                    </div>

                    {/* Regional Production & Efficiency */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Regional Production Output</CardTitle>
                                <CardDescription>Monthly food production by region (MT)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        production: {
                                            label: "Production (MT)",
                                            color: "var(--chart-1)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <BarChart data={regionsData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="region"
                                            tick={{ fontSize: 10 }}
                                            angle={-15}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="production" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Southern Europe leads in production volume
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Top 6 Countries Performance Comparison</CardTitle>
                                <CardDescription>Multi-dimensional analysis across key FoodMission metrics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        Germany: {
                                            label: "Germany",
                                            color: "var(--chart-1)",
                                        },
                                        Spain: {
                                            label: "Spain",
                                            color: "var(--chart-2)",
                                        },
                                        Italy: {
                                            label: "Italy",
                                            color: "var(--chart-3)",
                                        },
                                        Netherlands: {
                                            label: "Netherlands",
                                            color: "var(--chart-4)",
                                        },
                                        Poland: {
                                            label: "Poland",
                                            color: "var(--chart-5)",
                                        },
                                        Norway: {
                                            label: "Norway",
                                            color: "var(--chart-2)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <RadarChart data={countryRadarComparison}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="category" tick={{ fontSize: 9 }} />
                                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Radar
                                            name="Germany"
                                            dataKey="Germany"
                                            stroke="var(--chart-1)"
                                            fill="var(--chart-1)"
                                            fillOpacity={0.25}
                                            strokeWidth={2}
                                        />
                                        <Radar
                                            name="Spain"
                                            dataKey="Spain"
                                            stroke="var(--chart-2)"
                                            fill="var(--chart-2)"
                                            fillOpacity={0.25}
                                            strokeWidth={2}
                                        />
                                        <Radar
                                            name="Netherlands"
                                            dataKey="Netherlands"
                                            stroke="var(--chart-4)"
                                            fill="var(--chart-4)"
                                            fillOpacity={0.25}
                                            strokeWidth={2}
                                        />
                                        <Legend />
                                    </RadarChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Netherlands leads in sustainability and innovation; Spain in production capacity
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Country Comparison */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Country-Level Production vs Consumption</CardTitle>
                            <CardDescription>Comparative analysis of top producing countries (MT)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{
                                    production: {
                                        label: "Production",
                                        color: "var(--chart-3)",
                                    },
                                    consumption: {
                                        label: "Consumption",
                                        color: "var(--chart-4)",
                                    },
                                    export: {
                                        label: "Export",
                                        color: "var(--chart-5)",
                                    },
                                }}
                                className="h-[350px]"
                            >
                                <BarChart data={countryComparison}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="country" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="production" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="consumption" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="export" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground">
                            All countries show positive trade balance with exports exceeding imports
                        </CardFooter>
                    </Card>

                    {/* Country Radar Comparisons - Top Producers */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top 4 Producers Deep Dive</CardTitle>
                                <CardDescription>Comprehensive comparison: Spain, Italy, Germany, Netherlands</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        Spain: {
                                            label: "Spain",
                                            color: "var(--chart-1)",
                                        },
                                        Italy: {
                                            label: "Italy",
                                            color: "var(--chart-2)",
                                        },
                                        Germany: {
                                            label: "Germany",
                                            color: "var(--chart-3)",
                                        },
                                        Netherlands: {
                                            label: "Netherlands",
                                            color: "var(--chart-4)",
                                        },
                                    }}
                                    className="h-[320px]"
                                >
                                    <RadarChart data={top4ProducersRadar}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Radar
                                            name="Spain"
                                            dataKey="Spain"
                                            stroke="var(--chart-1)"
                                            fill="var(--chart-1)"
                                            fillOpacity={0.2}
                                            strokeWidth={2}
                                        />
                                        <Radar
                                            name="Italy"
                                            dataKey="Italy"
                                            stroke="var(--chart-2)"
                                            fill="var(--chart-2)"
                                            fillOpacity={0.2}
                                            strokeWidth={2}
                                        />
                                        <Radar
                                            name="Germany"
                                            dataKey="Germany"
                                            stroke="var(--chart-3)"
                                            fill="var(--chart-3)"
                                            fillOpacity={0.2}
                                            strokeWidth={2}
                                        />
                                        <Radar
                                            name="Netherlands"
                                            dataKey="Netherlands"
                                            stroke="var(--chart-4)"
                                            fill="var(--chart-4)"
                                            fillOpacity={0.2}
                                            strokeWidth={2}
                                        />
                                        <Legend />
                                    </RadarChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Italy excels in quality and diversity; Netherlands leads in innovation and exports
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Mediterranean vs Northern Profile</CardTitle>
                                <CardDescription>Regional food system characteristics comparison</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        Mediterranean: {
                                            label: "Mediterranean (ES, IT, GR)",
                                            color: "var(--chart-5)",
                                        },
                                        Northern: {
                                            label: "Northern (NO, NL, DE)",
                                            color: "var(--chart-2)",
                                        },
                                    }}
                                    className="h-[320px]"
                                >
                                    <RadarChart data={mediterraneanVsNorthern}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Radar
                                            name="Mediterranean"
                                            dataKey="Mediterranean"
                                            stroke="var(--chart-5)"
                                            fill="var(--chart-5)"
                                            fillOpacity={0.4}
                                            strokeWidth={3}
                                        />
                                        <Radar
                                            name="Northern"
                                            dataKey="Northern"
                                            stroke="var(--chart-2)"
                                            fill="var(--chart-2)"
                                            fillOpacity={0.4}
                                            strokeWidth={3}
                                        />
                                        <Legend />
                                    </RadarChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Mediterranean: higher production, local food; Northern: sustainability, innovation
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Urban vs Rural Distribution */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Urban vs Rural Distribution</CardTitle>
                                <CardDescription>Food system distribution by area type</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <ChartContainer
                                    config={{
                                        urban: {
                                            label: "Urban",
                                            color: "var(--chart-1)",
                                        },
                                        suburban: {
                                            label: "Suburban",
                                            color: "var(--chart-2)",
                                        },
                                        rural: {
                                            label: "Rural",
                                            color: "var(--chart-3)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <PieChart>
                                        <Pie
                                            data={urbanRuralData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ type, value }) => `${type}: ${value}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {urbanRuralData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Urban areas dominate food distribution networks
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Regional Population Coverage</CardTitle>
                                <CardDescription>Population served by food systems (millions)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        population: {
                                            label: "Population (M)",
                                            color: "var(--chart-4)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <AreaChart data={regionsData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="region"
                                            tick={{ fontSize: 10 }}
                                            angle={-15}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area
                                            type="monotone"
                                            dataKey="population"
                                            stroke="var(--chart-4)"
                                            fill="var(--chart-4)"
                                            fillOpacity={0.6}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Southern Europe has the largest population coverage
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
    );
}
