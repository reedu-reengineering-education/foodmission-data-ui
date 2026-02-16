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
import { Line, LineChart, Bar, BarChart, Area, AreaChart, XAxis, YAxis, CartesianGrid, ComposedChart, Cell, Pie, PieChart } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Trash2, TrendingDown, TrendingUp, AlertTriangle, Target, DollarSign } from "lucide-react";

// Mock food waste data
const wasteReductionTrend = [
    { month: "Jan", waste: 12500, target: 12000, reduction_rate: 8.2, cost: 25000 },
    { month: "Feb", waste: 11800, target: 11500, reduction_rate: 10.5, cost: 23600 },
    { month: "Mar", waste: 11200, target: 11000, reduction_rate: 12.8, cost: 22400 },
    { month: "Apr", waste: 10500, target: 10500, reduction_rate: 15.2, cost: 21000 },
    { month: "May", waste: 9800, target: 10000, reduction_rate: 18.5, cost: 19600 },
    { month: "Jun", waste: 9200, target: 9500, reduction_rate: 21.2, cost: 18400 },
];

const wasteBySector = [
    { sector: "Households", waste: 4200, percentage: 38 },
    { sector: "Food Service", waste: 2100, percentage: 19 },
    { sector: "Retail", waste: 1800, percentage: 16 },
    { sector: "Processing", waste: 1500, percentage: 13 },
    { sector: "Distribution", waste: 980, percentage: 9 },
    { sector: "Production", waste: 620, percentage: 5 },
];

const wasteByFoodType = [
    { type: "Fruits & Vegetables", value: 35, color: "var(--chart-1)" },
    { type: "Bread & Bakery", value: 22, color: "var(--chart-2)" },
    { type: "Dairy", value: 15, color: "var(--chart-3)" },
    { type: "Meat & Fish", value: 18, color: "var(--chart-4)" },
    { type: "Prepared Foods", value: 10, color: "var(--chart-5)" },
];

const wasteCauses = [
    { cause: "Spoilage", percentage: 32, trend: "decreasing" },
    { cause: "Overproduction", percentage: 24, trend: "stable" },
    { cause: "Poor Storage", percentage: 18, trend: "decreasing" },
    { cause: "Quality Standards", percentage: 15, trend: "stable" },
    { cause: "Consumer Behavior", percentage: 11, trend: "decreasing" },
];

const regionalWaste = [
    { region: "Northern EU", waste_per_capita: 85, reduction: 22 },
    { region: "Western EU", waste_per_capita: 92, reduction: 18 },
    { region: "Southern EU", waste_per_capita: 105, reduction: 12 },
    { region: "Central EU", waste_per_capita: 88, reduction: 20 },
    { region: "Eastern EU", waste_per_capita: 78, reduction: 25 },
];

const preventionMeasures = [
    { measure: "Donation Programs", impact: 28, adoption: 72 },
    { measure: "Smart Storage", impact: 22, adoption: 85 },
    { measure: "Portion Control", impact: 18, adoption: 68 },
    { measure: "Consumer Education", impact: 15, adoption: 55 },
    { measure: "Tech Solutions", impact: 12, adoption: 48 },
    { measure: "Policy Changes", impact: 5, adoption: 35 },
];

const wasteDestination = [
    { destination: "Composting", volume: 3500, percentage: 38 },
    { destination: "Animal Feed", volume: 2800, percentage: 30 },
    { destination: "Energy Recovery", volume: 1600, percentage: 18 },
    { destination: "Donation", volume: 900, percentage: 10 },
    { destination: "Landfill", volume: 400, percentage: 4 },
];

const economicImpact = [
    { month: "Jan", waste_cost: 25000, savings: 5000, recovery_value: 8000 },
    { month: "Feb", waste_cost: 23600, savings: 6400, recovery_value: 8500 },
    { month: "Mar", waste_cost: 22400, savings: 7600, recovery_value: 9000 },
    { month: "Apr", waste_cost: 21000, savings: 9000, recovery_value: 9500 },
    { month: "May", waste_cost: 19600, savings: 10400, recovery_value: 10000 },
    { month: "Jun", waste_cost: 18400, savings: 11600, recovery_value: 10500 },
];

const sdgContribution = [
    { goal: "Zero Hunger", progress: 75 },
    { goal: "Good Health", progress: 68 },
    { goal: "Responsible Consumption", progress: 82 },
    { goal: "Climate Action", progress: 78 },
    { goal: "Life on Land", progress: 72 },
];

export default function FoodWastePage() {
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
                                    <BreadcrumbPage>Food Waste</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Food Waste Analytics</h2>
                            <p className="text-muted-foreground">
                                Comprehensive waste tracking, reduction strategies, and impact assessment
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-700 border-green-500/20">
                                <TrendingDown className="h-3 w-3" />
                                -21.2% Reduction
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                                <Target className="h-3 w-3" />
                                On Target
                            </Badge>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Total Waste</CardDescription>
                                <Trash2 className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">9,200 tons</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingDown className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">-21.2%</span> vs baseline
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Waste Per Capita</CardDescription>
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">89.6 kg</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingDown className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">-18%</span> reduction
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Economic Savings</CardDescription>
                                <DollarSign className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">€11.6M</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">+132%</span> increase
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Diversion Rate</CardDescription>
                                <Target className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">96%</div>
                                <p className="text-xs text-muted-foreground">
                                    From landfills
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Waste Reduction Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Food Waste Reduction Progress</CardTitle>
                            <CardDescription>Monthly waste volume (tons) vs targets and economic impact</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{
                                    waste: {
                                        label: "Actual Waste",
                                        color: "var(--chart-3)",
                                    },
                                    target: {
                                        label: "Target",
                                        color: "var(--chart-2)",
                                    },
                                    reduction_rate: {
                                        label: "Reduction Rate %",
                                        color: "var(--chart-1)",
                                    },
                                }}
                                className="h-[350px]"
                            >
                                <ComposedChart data={wasteReductionTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                                    <YAxis yAxisId="right" orientation="right" domain={[0, 30]} tick={{ fontSize: 11 }} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="waste"
                                        fill="var(--chart-3)"
                                        stroke="var(--chart-3)"
                                        fillOpacity={0.4}
                                    />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="target"
                                        stroke="var(--chart-2)"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={{ fill: "var(--chart-2)" }}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="reduction_rate"
                                        stroke="var(--chart-1)"
                                        strokeWidth={2}
                                        dot={{ fill: "var(--chart-1)" }}
                                    />
                                </ComposedChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground">
                            Exceeding monthly targets since April 2026 with 21.2% total reduction
                        </CardFooter>
                    </Card>

                    {/* Waste by Sector & Food Type */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Waste Generation by Sector</CardTitle>
                                <CardDescription>Monthly waste volume (tons) and distribution (%)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        waste: {
                                            label: "Waste (tons)",
                                            color: "var(--chart-1)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <BarChart data={wasteBySector} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" tick={{ fontSize: 11 }} />
                                        <YAxis dataKey="sector" type="category" width={100} tick={{ fontSize: 10 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="waste" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Households account for 38% of total food waste
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Waste by Food Category</CardTitle>
                                <CardDescription>Distribution of wasted food types (%)</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <ChartContainer
                                    config={{
                                        value: {
                                            label: "Percentage",
                                            color: "var(--chart-1)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <PieChart>
                                        <Pie
                                            data={wasteByFoodType}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ type, value }) => `${value}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {wasteByFoodType.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Fruits & vegetables represent the largest waste category at 35%
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Regional Waste & Prevention Measures */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Regional Waste Performance</CardTitle>
                                <CardDescription>Per capita waste (kg/year) and reduction achieved (%)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        waste_per_capita: {
                                            label: "Waste Per Capita",
                                            color: "var(--chart-3)",
                                        },
                                        reduction: {
                                            label: "Reduction %",
                                            color: "var(--chart-2)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <BarChart data={regionalWaste}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="region"
                                            tick={{ fontSize: 10 }}
                                            angle={-15}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                                        <YAxis yAxisId="right" orientation="right" domain={[0, 30]} tick={{ fontSize: 11 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar
                                            yAxisId="left"
                                            dataKey="waste_per_capita"
                                            fill="var(--chart-3)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            yAxisId="right"
                                            dataKey="reduction"
                                            fill="var(--chart-2)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Eastern Europe achieves highest reduction rate at 25%
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Prevention Measures Impact</CardTitle>
                                <CardDescription>Waste reduction impact (%) vs adoption rate (%)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        impact: {
                                            label: "Impact %",
                                            color: "var(--chart-1)",
                                        },
                                        adoption: {
                                            label: "Adoption %",
                                            color: "var(--chart-4)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <BarChart data={preventionMeasures} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                                        <YAxis dataKey="measure" type="category" width={120} tick={{ fontSize: 9 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="impact" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="adoption" fill="var(--chart-4)" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Donation programs show highest impact but moderate adoption
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Waste Destination & Economic Impact */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Waste Destination & Recovery</CardTitle>
                                <CardDescription>Volume distribution across recovery channels (tons)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        volume: {
                                            label: "Volume (tons)",
                                            color: "var(--chart-2)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <BarChart data={wasteDestination}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="destination"
                                            tick={{ fontSize: 10 }}
                                            angle={-15}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="volume" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                96% of waste diverted from landfills through recovery programs
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Economic Impact Analysis</CardTitle>
                                <CardDescription>Monthly cost savings and value recovery (€1000s)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        waste_cost: {
                                            label: "Waste Cost",
                                            color: "var(--chart-3)",
                                        },
                                        savings: {
                                            label: "Savings",
                                            color: "var(--chart-2)",
                                        },
                                        recovery_value: {
                                            label: "Recovery Value",
                                            color: "var(--chart-4)",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <LineChart data={economicImpact}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Line
                                            type="monotone"
                                            dataKey="waste_cost"
                                            stroke="var(--chart-3)"
                                            strokeWidth={2}
                                            dot={{ fill: "var(--chart-3)" }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="savings"
                                            stroke="var(--chart-2)"
                                            strokeWidth={2}
                                            dot={{ fill: "var(--chart-2)" }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="recovery_value"
                                            stroke="var(--chart-4)"
                                            strokeWidth={2}
                                            dot={{ fill: "var(--chart-4)" }}
                                        />
                                    </LineChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                Combined savings and recovery value now exceed waste costs
                            </CardFooter>
                        </Card>
                    </div>

                    {/* SDG Contribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>UN SDG Contribution Progress</CardTitle>
                            <CardDescription>Progress towards Sustainable Development Goals (%)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{
                                    progress: {
                                        label: "Progress %",
                                        color: "var(--chart-2)",
                                    },
                                }}
                                className="h-[300px]"
                            >
                                <BarChart data={sdgContribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="goal"
                                        tick={{ fontSize: 10 }}
                                        angle={-15}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="progress" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground">
                            Strong contribution to SDG 12 (Responsible Consumption) at 82% progress
                        </CardFooter>
                    </Card>
                </div>
            </SidebarInset>
    );
}
