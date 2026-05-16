import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

interface AnalyticsChartCardProps {
  title: string;
  description?: string;
  config: ChartConfig;
  className?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function AnalyticsChartCard({
  title,
  description,
  config,
  className = "h-[350px]",
  footer,
  children,
}: AnalyticsChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className={className}>
          {children}
        </ChartContainer>
      </CardContent>
      {footer && <CardFooter className="text-xs text-muted-foreground">{footer}</CardFooter>}
    </Card>
  );
}
