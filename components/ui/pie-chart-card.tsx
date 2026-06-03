"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PIE_COLORS } from "@/lib/constants";

interface PieChartCardProps {
  id?: string;
  title: string;
  description?: string;
  /** Array of data objects. Each item must have the `nameKey` and `dataKey` fields. */
  data: Record<string, unknown>[];
  /** The numeric field to measure */
  dataKey: string;
  /** The label/name field shown in the legend */
  nameKey: string;
  innerRadius?: number;
  outerRadius?: number;
  /** Fixed height for the SVG chart area (default 220) */
  chartHeight?: number;
  footer?: React.ReactNode;
  className?: string;
}

export function PieChartCard({
  id,
  title,
  description,
  data,
  dataKey,
  nameKey,
  innerRadius = 55,
  outerRadius = 95,
  chartHeight = 220,
  footer,
  className,
}: PieChartCardProps) {
  const config = Object.fromEntries(
    data.map((d, i) => [
      d[nameKey] as string,
      { label: d[nameKey] as string, color: PIE_COLORS[i % PIE_COLORS.length] },
    ])
  );

  return (
    <Card id={id} className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          style={{ height: chartHeight }}
          className="w-full"
        >
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
        {/* Wrapped legend rendered outside SVG to prevent overflow */}
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {data.map((d, i) => (
            <div
              key={d[nameKey] as string}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
              />
              {d[nameKey] as string}
            </div>
          ))}
        </div>
      </CardContent>
      {footer && (
        <CardFooter className="text-xs text-muted-foreground">{footer}</CardFooter>
      )}
    </Card>
  );
}
