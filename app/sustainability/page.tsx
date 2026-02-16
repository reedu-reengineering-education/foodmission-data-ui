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
import { Line, LineChart, Bar, BarChart, Area, AreaChart, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Leaf, Droplets, Wind, Sprout, TrendingDown, TrendingUp } from "lucide-react";

// Mock sustainability data
const carbonFootprintData = [
    { month: "Jan", emissions: 128, target: 120, reduction: 8 },
    { month: "Feb", emissions: 124, target: 118, reduction: 10 },
    { month: "Mar", emissions: 120, target: 116, reduction: 12 },
    { month: "Apr", emissions: 116, target: 114, reduction: 14 },
    { month: "May", emissions: 112, target: 112, reduction: 16 },
    { month: "Jun", emissions: 108, target: 110, reduction: 18 },
];

const waterUsageData = [
    { category: "Irrigation", usage: 45000, efficiency: 72 },
    { category: "Processing", usage: 28000, efficiency: 85 },
    { category: "Cleaning", usage: 18000, efficiency: 78 },
    { category: "Cooling", usage: 22000, efficiency: 81 },
    { category: "Other", usage: 12000, efficiency: 68 },
];

const renewableEnergyData = [
    { month: "Jan", renewable: 42, fossil: 58 },
    { month: "Feb", renewable: 45, fossil: 55 },
    { month: "Mar", renewable: 48, fossil: 52 },
    { month: "Apr", renewable: 52, fossil: 48 },
    { month: "May", renewable: 55, fossil: 45 },
    { month: "Jun", renewable: 58, fossil: 42 },
];

const sustainabilityRadarData = [
    { subject: "Carbon Footprint", score: 82, fullMark: 100 },
    { subject: "Water Usage", score: 78, fullMark: 100 },
    { subject: "Energy Efficiency", score: 85, fullMark: 100 },
    { subject: "Biodiversity", score: 73, fullMark: 100 },
    { subject: "Soil Health", score: 80, fullMark: 100 },
    { subject: "Renewable Energy", score: 88, fullMark: 100 },
];

const landUseData = [
    { type: "Cropland", organic: 35, conventional: 65 },
    { type: "Pasture", organic: 42, conventional: 58 },
    { type: "Forest", preserved: 78, managed: 22 },
    { type: "Urban Farming", area: 12 },
];

const packagingData = [
    { month: "Jan", recyclable: 62, compostable: 18, reusable: 12, other: 8 },
    { month: "Feb", recyclable: 64, compostable: 19, reusable: 13, other: 4 },
    { month: "Mar", recyclable: 66, compostable: 20, reusable: 11, other: 3 },
    { month: "Apr", recyclable: 68, compostable: 21, reusable: 9, other: 2 },
    { month: "May", recyclable: 70, compostable: 22, reusable: 7, other: 1 },
    { month: "Jun", recyclable: 72, compostable: 23, reusable: 5, other: 0 },
];

const biodiversityData = [
    { indicator: "Pollinator Species", value: 85, change: 8 },
    { indicator: "Crop Diversity", value: 78, change: 12 },
    { indicator: "Soil Organisms", value: 82, change: 6 },
    { indicator: "Native Plants", value: 76, change: 15 },
    { indicator: "Wildlife Habitat", value: 80, change: 10 },
];

const regionalSustainability = [
    { region: "Northern EU", overall: 88, carbon: 90, water: 85, energy: 89 },
    { region: "Western EU", overall: 92, carbon: 93, water: 91, energy: 92 },
    { region: "Southern EU", overall: 78, carbon: 75, water: 78, energy: 81 },
    { region: "Central EU", overall: 85, carbon: 86, water: 83, energy: 86 },
    { region: "Eastern EU", overall: 76, carbon: 74, water: 76, energy: 78 },
];

export default function SustainabilityPage() {
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
                                    <BreadcrumbPage>Sustainability</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Sustainability Metrics</h2>
                            <p className="text-muted-foreground">
                                Environmental impact assessment and sustainable practices monitoring
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-700 border-green-500/20">
                                <Leaf className="h-3 w-3" />
                                82/100 Score
                            </Badge>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Carbon Emissions</CardDescription>
                                <Wind className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">108K tons</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingDown className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">-15.6%</span> reduction
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Water Efficiency</CardDescription>
                                <Droplets className="h-4 w-4 text-blue-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">78%</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">+6.2%</span> improved
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Renewable Energy</CardDescription>
                                <Sprout className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">58%</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">+16%</span> increase
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Biodiversity Index</CardDescription>
                                <Leaf className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">80.2</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">+10.2</span> points
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Carbon Footprint & Radar Chart */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Carbon Footprint Trajectory</CardTitle>
                                <CardDescription>CO₂ emissions vs reduction targets (K tons)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        emissions: {
                                            label: "Actual Emissions",
                                            color: "var(--chart-3)",
                                        },
                                        target: {
                                            label: "Target",
                                            color: "var(--chart-2)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <ComposedChart data={carbonFootprintData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area
                                            type="monotone"
                                            dataKey="emissions"
                                            fill="var(--chart-3)"
                                            stroke="var(--chart-3)"
                                            fillOpacity={0.4}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="target"
                                            stroke="var(--chart-2)"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            dot={{ fill: "var(--chart-2)" }}
                                        />
                                    </ComposedChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                On track to meet 2026 emission reduction targets
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Overall Sustainability Assessment</CardTitle>
                                <CardDescription>Multi-dimensional environmental performance</CardDescription>
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
                                    <RadarChart data={sustainabilityRadarData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
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
                                Renewable energy and carbon footprint showing strongest performance
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Water Usage & Renewable Energy */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Water Usage by Category</CardTitle>
                                <CardDescription>Annual consumption (m³) and efficiency score</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        usage: {
                                            label: "Usage (m³)",
                                            color: "var(--chart-1)",
                                        },
                                        efficiency: {
                                            label: "Efficiency %",
                                            color: "var(--chart-4)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <ComposedChart data={waterUsageData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="category"
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
                                            dataKey="usage"
                                            fill="var(--chart-1)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="efficiency"
                                            stroke="var(--chart-4)"
                                            strokeWidth={2}
                                            dot={{ fill: "var(--chart-4)" }}
                                        />
                                    </ComposedChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Processing shows highest water efficiency at 85%
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Renewable vs Fossil Energy Mix</CardTitle>
                                <CardDescription>Energy source distribution trend (%)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        renewable: {
                                            label: "Renewable",
                                            color: "var(--chart-2)",
                                        },
                                        fossil: {
                                            label: "Fossil",
                                            color: "var(--chart-3)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <AreaChart data={renewableEnergyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area
                                            type="monotone"
                                            dataKey="renewable"
                                            stackId="1"
                                            stroke="var(--chart-2)"
                                            fill="var(--chart-2)"
                                            fillOpacity={0.8}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="fossil"
                                            stackId="1"
                                            stroke="var(--chart-3)"
                                            fill="var(--chart-3)"
                                            fillOpacity={0.8}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Renewable energy projected to exceed 60% by Q4 2026
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Packaging & Biodiversity */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sustainable Packaging Adoption</CardTitle>
                                <CardDescription>Packaging material composition over time (%)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        recyclable: {
                                            label: "Recyclable",
                                            color: "var(--chart-1)",
                                        },
                                        compostable: {
                                            label: "Compostable",
                                            color: "var(--chart-2)",
                                        },
                                        reusable: {
                                            label: "Reusable",
                                            color: "var(--chart-4)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <LineChart data={packagingData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis domain={[0, 80]} tick={{ fontSize: 11 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Line
                                            type="monotone"
                                            dataKey="recyclable"
                                            stroke="var(--chart-1)"
                                            strokeWidth={2}
                                            dot={{ fill: "var(--chart-1)" }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="compostable"
                                            stroke="var(--chart-2)"
                                            strokeWidth={2}
                                            dot={{ fill: "var(--chart-2)" }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="reusable"
                                            stroke="var(--chart-4)"
                                            strokeWidth={2}
                                            dot={{ fill: "var(--chart-4)" }}
                                        />
                                    </LineChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Non-recyclable packaging eliminated as of May 2026
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Biodiversity Indicators</CardTitle>
                                <CardDescription>Health scores across key biodiversity metrics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        value: {
                                            label: "Score",
                                            color: "var(--chart-2)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <BarChart data={biodiversityData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                                        <YAxis dataKey="indicator" type="category" width={120} tick={{ fontSize: 10 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="value" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                All biodiversity indicators above 75/100 threshold
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Regional Sustainability Comparison */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Regional Sustainability Performance</CardTitle>
                            <CardDescription>Comparative sustainability scores across European regions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{
                                    overall: {
                                        label: "Overall Score",
                                        color: "var(--chart-1)",
                                    },
                                    carbon: {
                                        label: "Carbon",
                                        color: "var(--chart-2)",
                                    },
                                    water: {
                                        label: "Water",
                                        color: "var(--chart-3)",
                                    },
                                    energy: {
                                        label: "Energy",
                                        color: "var(--chart-4)",
                                    },
                                }}
                                className="h-[350px]"
                            >
                                <BarChart data={regionalSustainability}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="region"
                                        tick={{ fontSize: 10 }}
                                        angle={-15}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="overall" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="carbon" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="water" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="energy" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground">
                            Western Europe leads with 92/100 overall sustainability score
                        </CardFooter>
                    </Card>
                </div>
            </SidebarInset>
    );
}
