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
import { Line, LineChart, Bar, BarChart, Area, AreaChart, XAxis, YAxis, CartesianGrid, ComposedChart } from "recharts";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Zap, AlertTriangle } from "lucide-react";

// Mock supply chain data
const supplyChainFlowData = [
    { stage: "Farm", volume: 100000, losses: 5, time: 0 },
    { stage: "Processing", volume: 95000, losses: 8, time: 2 },
    { stage: "Distribution", volume: 87400, losses: 6, time: 5 },
    { stage: "Retail", volume: 82156, losses: 7, time: 8 },
    { stage: "Consumer", volume: 76385, losses: 10, time: 12 },
];

const transportationData = [
    { month: "Jan", truck: 45000, rail: 28000, sea: 15000, efficiency: 78 },
    { month: "Feb", truck: 47000, rail: 29000, sea: 16000, efficiency: 79 },
    { month: "Mar", truck: 48500, rail: 31000, sea: 17500, efficiency: 82 },
    { month: "Apr", truck: 49000, rail: 32000, sea: 18000, efficiency: 84 },
    { month: "May", truck: 50500, rail: 33500, sea: 18500, efficiency: 85 },
    { month: "Jun", truck: 52000, rail: 35000, sea: 19000, efficiency: 87 },
];

const storageData = [
    { facility: "Cold Storage", capacity: 85, utilization: 72 },
    { facility: "Dry Warehouse", capacity: 92, utilization: 88 },
    { facility: "Fresh Storage", capacity: 78, utilization: 65 },
    { facility: "Processing", capacity: 88, utilization: 82 },
    { facility: "Distribution", capacity: 95, utilization: 91 },
];

const deliveryTimeData = [
    { route: "Local", avgTime: 24, onTime: 94 },
    { route: "Regional", avgTime: 72, onTime: 89 },
    { route: "National", avgTime: 120, onTime: 85 },
    { route: "Cross-border", avgTime: 168, onTime: 78 },
];

const supplierPerformance = [
    { month: "Jan", reliability: 88, quality: 92, delivery: 85, cost: 78 },
    { month: "Feb", reliability: 89, quality: 91, delivery: 87, cost: 80 },
    { month: "Mar", reliability: 90, quality: 93, delivery: 88, cost: 82 },
    { month: "Apr", reliability: 91, quality: 94, delivery: 89, cost: 83 },
    { month: "May", reliability: 92, quality: 95, delivery: 91, cost: 85 },
    { month: "Jun", reliability: 93, quality: 96, delivery: 92, cost: 87 },
];

const costBreakdown = [
    { category: "Transport", cost: 32000, percentage: 28 },
    { category: "Storage", cost: 25000, percentage: 22 },
    { category: "Processing", cost: 38000, percentage: 33 },
    { category: "Packaging", cost: 12000, percentage: 10 },
    { category: "Quality Control", cost: 8000, percentage: 7 },
];

export default function SupplyChainPage() {
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
                                    <BreadcrumbPage>Supply Chain</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Supply Chain Analytics</h2>
                            <p className="text-muted-foreground">
                                End-to-end food supply chain monitoring and optimization
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="gap-1">
                                <TrendingUp className="h-3 w-3" />
                                87% Efficiency
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                                <Clock className="h-3 w-3" />
                                5.2 days avg
                            </Badge>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Chain Efficiency</CardDescription>
                                <Zap className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">87.4%</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">+3.2%</span> vs last month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>On-Time Delivery</CardDescription>
                                <Clock className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">91.2%</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">+1.8%</span> improvement
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Supply Chain Losses</CardDescription>
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">7.6%</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">-1.2%</span> reduction
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Active Routes</CardDescription>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">342</div>
                                <p className="text-xs text-muted-foreground">
                                    Across 28 regions
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Supply Chain Flow */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Supply Chain Flow Analysis</CardTitle>
                            <CardDescription>Volume flow and losses across supply chain stages</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{
                                    volume: {
                                        label: "Volume (tons)",
                                        color: "var(--chart-1)",
                                    },
                                    losses: {
                                        label: "Losses (%)",
                                        color: "var(--chart-3)",
                                    },
                                }}
                                className="h-[300px]"
                            >
                                <ComposedChart data={supplyChainFlowData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="volume"
                                        fill="var(--chart-1)"
                                        stroke="var(--chart-1)"
                                        fillOpacity={0.6}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="losses"
                                        stroke="var(--chart-3)"
                                        strokeWidth={2}
                                        dot={{ fill: "var(--chart-3)" }}
                                    />
                                </ComposedChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground">
                            Overall supply chain retention rate: 76.4% from farm to consumer
                        </CardFooter>
                    </Card>

                    {/* Transportation & Supplier Performance */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Transportation Modes Distribution</CardTitle>
                                <CardDescription>Monthly volume by transport method (tons)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        truck: {
                                            label: "Truck",
                                            color: "var(--chart-1)",
                                        },
                                        rail: {
                                            label: "Rail",
                                            color: "var(--chart-2)",
                                        },
                                        sea: {
                                            label: "Sea",
                                            color: "var(--chart-3)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <AreaChart data={transportationData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area
                                            type="monotone"
                                            dataKey="truck"
                                            stackId="1"
                                            stroke="var(--chart-1)"
                                            fill="var(--chart-1)"
                                            fillOpacity={0.8}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="rail"
                                            stackId="1"
                                            stroke="var(--chart-2)"
                                            fill="var(--chart-2)"
                                            fillOpacity={0.8}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="sea"
                                            stackId="1"
                                            stroke="var(--chart-3)"
                                            fill="var(--chart-3)"
                                            fillOpacity={0.8}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Truck transport dominates but rail usage is increasing
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Supplier Performance Metrics</CardTitle>
                                <CardDescription>6-month trend of key supplier indicators</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        reliability: {
                                            label: "Reliability",
                                            color: "var(--chart-1)",
                                        },
                                        quality: {
                                            label: "Quality",
                                            color: "var(--chart-2)",
                                        },
                                        delivery: {
                                            label: "Delivery",
                                            color: "var(--chart-3)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <LineChart data={supplierPerformance}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Line
                                            type="monotone"
                                            dataKey="reliability"
                                            stroke="var(--chart-1)"
                                            strokeWidth={2}
                                            dot={{ fill: "var(--chart-1)" }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="quality"
                                            stroke="var(--chart-2)"
                                            strokeWidth={2}
                                            dot={{ fill: "var(--chart-2)" }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="delivery"
                                            stroke="var(--chart-3)"
                                            strokeWidth={2}
                                            dot={{ fill: "var(--chart-3)" }}
                                        />
                                    </LineChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                All supplier metrics showing positive upward trends
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Storage & Delivery Time */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Storage Facility Utilization</CardTitle>
                                <CardDescription>Capacity vs utilization by facility type (%)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        capacity: {
                                            label: "Capacity",
                                            color: "var(--chart-4)",
                                        },
                                        utilization: {
                                            label: "Utilization",
                                            color: "var(--chart-5)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <BarChart data={storageData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="facility"
                                            tick={{ fontSize: 10 }}
                                            angle={-15}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="capacity" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="utilization" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Distribution centers showing optimal utilization rates
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Delivery Performance by Route</CardTitle>
                                <CardDescription>Average delivery time (hours) and on-time rate (%)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        avgTime: {
                                            label: "Avg Time (hrs)",
                                            color: "var(--chart-1)",
                                        },
                                        onTime: {
                                            label: "On-Time %",
                                            color: "var(--chart-2)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <ComposedChart data={deliveryTimeData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="route" tick={{ fontSize: 11 }} />
                                        <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                                        <YAxis yAxisId="right" orientation="right" domain={[70, 100]} tick={{ fontSize: 11 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar
                                            yAxisId="left"
                                            dataKey="avgTime"
                                            fill="var(--chart-1)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="onTime"
                                            stroke="var(--chart-2)"
                                            strokeWidth={2}
                                            dot={{ fill: "var(--chart-2)" }}
                                        />
                                    </ComposedChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Local routes show best on-time performance
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
    );
}
