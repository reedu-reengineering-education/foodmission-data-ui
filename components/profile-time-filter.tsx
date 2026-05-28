"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export type TimeRange = "week" | "month" | "year" | "all";

const OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "week", label: "Last week" },
  { value: "month", label: "Last month" },
  { value: "year", label: "Last year" },
  { value: "all", label: "All time" },
];

export function ProfileTimeFilter({ active }: { active: TimeRange }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          size="sm"
          variant={active === opt.value ? "default" : "outline"}
          onClick={() =>
            router.replace(`/personal-profile?range=${opt.value}`, {
              scroll: false,
            })
          }
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
