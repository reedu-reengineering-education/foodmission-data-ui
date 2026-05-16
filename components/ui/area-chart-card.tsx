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
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

export interface AreaSpec {
  dataKey: string;
  stroke: string;
  fill: string;
  fillOpacity?: number;
  stackId?: string;
}

interface AreaChartCardProps {
  id?: string;
  title: string;
  description?: string;
  config: ChartConfig;
  data: Record<string, unknown>[];
  areas: AreaSpec[];
  /** X-axis data key (default: "date") */
  xAxisKey?: string;
  /** Optional y-axis unit label rendered vertically */
  yAxisLabel?: string;
  showLegend?: boolean;
  /** Tailwind height class applied to ChartContainer (default: "h-[350px] w-full aspect-auto") */
  height?: string;
  footer?: React.ReactNode;
  className?: string;
}

export function AreaChartCard({
  id,
  title,
  description,
  config,
  data,
  areas,
  xAxisKey = "date",
  yAxisLabel,
  showLegend,
  height = "h-[350px] w-full aspect-auto",
  footer,
  className,
}: AreaChartCardProps) {
  return (
    <Card id={id} className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className={height}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              {...(yAxisLabel
                ? { label: { value: yAxisLabel, angle: -90, position: "insideLeft" } }
                : {})}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
            {areas.map((area) => (
              <Area
                key={area.dataKey}
                type="monotone"
                dataKey={area.dataKey}
                stroke={area.stroke}
                fill={area.fill}
                fillOpacity={area.fillOpacity ?? 0.2}
                stackId={area.stackId}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
      {footer && (
        <CardFooter className="text-xs text-muted-foreground">{footer}</CardFooter>
      )}
    </Card>
  );
}
