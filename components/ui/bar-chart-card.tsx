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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

export interface BarSpec {
  dataKey: string;
  fill: string;
  radius?: [number, number, number, number];
  stackId?: string;
}

interface BarChartCardProps {
  id?: string;
  title: string;
  description?: string;
  config: ChartConfig;
  data: Record<string, unknown>[];
  bars: BarSpec[];
  /** X-axis data key (default: "name") */
  xAxisKey?: string;
  /** Rotate x-axis labels. When set, height=80 and textAnchor="end" are applied automatically. */
  xAxisAngle?: number;
  /** Optional y-axis unit label rendered vertically on the left */
  yAxisLabel?: string;
  showLegend?: boolean;
  /** Tailwind height class (default: "h-[350px]"). Width defaults to w-full aspect-auto. */
  height?: string;
  footer?: React.ReactNode;
  className?: string;
}

export function BarChartCard({
  id,
  title,
  description,
  config,
  data,
  bars,
  xAxisKey = "name",
  xAxisAngle,
  yAxisLabel,
  showLegend,
  height = "h-[350px]",
  footer,
  className,
}: BarChartCardProps) {
  const rotated = xAxisAngle !== undefined;

  return (
    <Card id={id} className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className={cn(height, "w-full aspect-auto")}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: rotated ? 10 : 11 }}
              {...(rotated ? { angle: xAxisAngle, textAnchor: "end", height: 80 } : {})}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              {...(yAxisLabel
                ? { label: { value: yAxisLabel, angle: -90, position: "insideLeft" } }
                : {})}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                fill={bar.fill}
                radius={bar.radius ?? [4, 4, 0, 0]}
                stackId={bar.stackId}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
      {footer && (
        <CardFooter className="text-xs text-muted-foreground">{footer}</CardFooter>
      )}
    </Card>
  );
}
