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
import type { Formatter } from "recharts/types/component/DefaultTooltipContent";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

export interface HBarSpec {
  dataKey: string;
  fill: string;
  radius?: [number, number, number, number];
}

interface HorizontalBarChartCardProps {
  id?: string;
  title: string;
  description?: string;
  config: ChartConfig;
  data: Record<string, unknown>[];
  bars: HBarSpec[];
  /** The key used for category labels on the Y axis */
  yAxisKey: string;
  /** Width of the Y axis label column (default: 120) */
  yAxisWidth?: number;
  showLegend?: boolean;
  /** Optional custom tooltip value formatter */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tooltipFormatter?: Formatter<any, any>;
  /**
   * Height of the chart area. Pass a Tailwind class string (e.g. "h-[350px]")
   * or a pixel number for dynamic height (e.g. data.length * 28).
   * Default: "h-[350px]"
   */
  height?: string | number;
  /** Minimum pixel width before horizontal scrolling kicks in. Default: 400 */
  minWidth?: number;
  footer?: React.ReactNode;
  className?: string;
}

export function HorizontalBarChartCard({
  id,
  title,
  description,
  config,
  data,
  bars,
  yAxisKey,
  yAxisWidth = 120,
  showLegend,
  tooltipFormatter,
  height = "h-[350px]",
  minWidth = 400,
  footer,
  className,
}: HorizontalBarChartCardProps) {
  const containerProps =
    typeof height === "number"
      ? { style: { height }, className: "w-full" }
      : { className: cn(height, "w-full") };

  return (
    <Card id={id} className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={typeof height === "number" ? "p-0 pb-4" : "overflow-x-auto"}>
        {typeof height === "number" ? (
          <div className="overflow-auto">
            <ChartContainer config={config} {...containerProps}>
              <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis
                  dataKey={yAxisKey}
                  type="category"
                  width={yAxisWidth}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent formatter={tooltipFormatter} />} />
                {showLegend && <ChartLegend content={<ChartLegendContent />} />}
                {bars.map((bar) => (
                  <Bar
                    key={bar.dataKey}
                    dataKey={bar.dataKey}
                    fill={bar.fill}
                    radius={bar.radius ?? [0, 4, 4, 0]}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          </div>
        ) : (
          <div style={{ minWidth }}>
            <ChartContainer config={config} {...containerProps}>
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey={yAxisKey}
                  type="category"
                  width={yAxisWidth}
                  tick={{ fontSize: 10 }}
                />
                <ChartTooltip content={<ChartTooltipContent formatter={tooltipFormatter} />} />
                {showLegend && <ChartLegend content={<ChartLegendContent />} />}
                {bars.map((bar) => (
                  <Bar
                    key={bar.dataKey}
                    dataKey={bar.dataKey}
                    fill={bar.fill}
                    radius={bar.radius ?? [0, 4, 4, 0]}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
      {footer && (
        <CardFooter className="text-xs text-muted-foreground">{footer}</CardFooter>
      )}
    </Card>
  );
}
