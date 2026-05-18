"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MEAL_TYPES, DIMENSIONS, DIMENSION_LABELS } from "@/lib/constants";

interface AnalyticsFiltersProps {
  periodStart: string;
  periodEnd: string;
  typeOfMeal?: string;
  onPeriodStartChange: (v: string) => void;
  onPeriodEndChange: (v: string) => void;
  onTypeOfMealChange?: (v: string) => void;
  onApply: () => void;
  showTypeOfMeal?: boolean;
  showDimension?: boolean;
  dimension?: string;
  onDimensionChange?: (v: string) => void;
  showCrossDim?: boolean;
  dim1?: string;
  dim2?: string;
  onDim1Change?: (v: string) => void;
  onDim2Change?: (v: string) => void;
}

export function AnalyticsFiltersBar({
  periodStart,
  periodEnd,
  typeOfMeal = "",
  onPeriodStartChange,
  onPeriodEndChange,
  onTypeOfMealChange = () => {},
  onApply,
  showTypeOfMeal = true,
  showDimension = false,
  dimension,
  onDimensionChange,
  showCrossDim = false,
  dim1,
  dim2,
  onDim1Change,
  onDim2Change,
}: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border p-4 bg-muted/30">
      <div className="space-y-1">
        <Label className="text-xs">From</Label>
        <Input
          type="date"
          className="h-8 w-36"
          value={periodStart}
          onChange={(e) => onPeriodStartChange(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">To</Label>
        <Input
          type="date"
          className="h-8 w-36"
          value={periodEnd}
          onChange={(e) => onPeriodEndChange(e.target.value)}
        />
      </div>

      {showTypeOfMeal && (
        <div className="space-y-1">
          <Label className="text-xs">Meal Type</Label>
          <select
            className="flex h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={typeOfMeal}
            onChange={(e) => onTypeOfMealChange(e.target.value)}
          >
            <option value="">All</option>
            {MEAL_TYPES.map((m) => (
              <option key={m} value={m}>
                {m.charAt(0) + m.slice(1).toLowerCase().replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      )}

      {showDimension && onDimensionChange && (
        <div className="space-y-1">
          <Label className="text-xs">Dimension</Label>
          <select
            className="flex h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={dimension ?? ""}
            onChange={(e) => onDimensionChange(e.target.value)}
          >
            <option value="">All</option>
            {DIMENSIONS.map((d) => (
              <option key={d} value={d}>
                {DIMENSION_LABELS[d]}
              </option>
            ))}
          </select>
        </div>
      )}

      {showCrossDim && onDim1Change && onDim2Change && (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Dimension 1</Label>
            <select
              className="flex h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={dim1 ?? ""}
              onChange={(e) => onDim1Change(e.target.value)}
            >
              <option value="">Any</option>
              {DIMENSIONS.map((d) => (
                <option key={d} value={d}>
                  {DIMENSION_LABELS[d]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Dimension 2</Label>
            <select
              className="flex h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={dim2 ?? ""}
              onChange={(e) => onDim2Change(e.target.value)}
            >
              <option value="">Any</option>
              {DIMENSIONS.map((d) => (
                <option key={d} value={d}>
                  {DIMENSION_LABELS[d]}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <Button size="sm" className="h-8" onClick={onApply}>
        Apply
      </Button>
    </div>
  );
}
