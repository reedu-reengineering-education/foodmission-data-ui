"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  EmptyState,
  InsightCard,
  InsightTable,
  LoadState,
  OptionButtons,
  OTHER_COLOR,
  OTHER_KEY,
  SERIES_COLORS,
  suppressedNote,
  VIEW_OPTIONS,
  type View,
} from "@/components/insight-ui";
import {
  columnLabel,
  formatWeek,
  groupLabel,
  useCatalog,
  useInsight,
  weekStarts,
  type Catalog,
  type InsightParams,
  type InsightResponse,
} from "@/lib/insights-api";

const TREND_WEEKS = 12;
/** dimension-focus / xp-sources value for "no quest" / "no dimension". */
const NONE = "none";

// ── Generic panel ─────────────────────────────────────────

interface PanelProps {
  catalog: Catalog;
  /** Catalog insight id; area and description come from the catalog. */
  id: string;
  title: string;
  description: string;
  params: InsightParams;
  /** Value columns of the table view. */
  values: readonly string[];
  /** Chart view; without it the panel is always a table. */
  chart?: (response: InsightResponse) => ReactNode;
  controls?: ReactNode;
  className?: string;
  height?: number;
}

/**
 * One insight as a card. Charts show the overall picture; with a split
 * (breakdown) or on request the rows are shown as a table instead.
 */
function InsightPanel({
  catalog,
  id,
  title,
  description,
  params,
  values,
  chart,
  controls,
  className,
  height = 280,
}: PanelProps) {
  const [view, setView] = useState<View>("chart");
  const insight = catalog.insights.find((i) => i.id === id);
  const result = useInsight(`${insight?.area ?? "learning"}/${id}`, params);
  const response = result.status === "ok" ? result.data : null;
  const split = Boolean(params.breakdown);
  const showTable = !chart || split || view === "table";

  return (
    <InsightCard
      title={title}
      description={description}
      className={className}
      controls={
        <>
          {controls}
          {chart && !split && (
            <OptionButtons
              label="View"
              options={VIEW_OPTIONS}
              value={view}
              onChange={setView}
            />
          )}
        </>
      }
      footer={[response && suppressedNote(response.meta)]}
    >
      {!response ? (
        <LoadState result={result} height={height} />
      ) : response.rows.length === 0 ? (
        <EmptyState height={height} />
      ) : showTable ? (
        <InsightTable catalog={catalog} response={response} values={values} />
      ) : (
        chart?.(response)
      )}
      {insight && (
        <details className="mt-3 text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none">
            How this is counted
          </summary>
          <p className="mt-1 leading-relaxed">{insight.description}</p>
        </details>
      )}
    </InsightCard>
  );
}

/** Rollup buttons for an insight's `by` options, labelled from the catalog. */
function RollupButtons({
  catalog,
  id,
  value,
  onChange,
}: {
  catalog: Catalog;
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const options = catalog.insights.find((i) => i.id === id)?.by ?? [];
  return (
    <OptionButtons
      label="Group by"
      options={options.map((by) => ({
        value: by,
        label: by === "item" ? "Item" : columnLabel(catalog, by),
      }))}
      value={value}
      onChange={onChange}
    />
  );
}

// ── Charts ────────────────────────────────────────────────

/** Dimension order from the catalog; unknown codes and "none" last. */
function dimensionOrder(catalog: Catalog) {
  const order = catalog.dimensions.map((d) => d.code);
  return (code: string) => {
    const i = order.indexOf(code);
    return i === -1 ? order.length + (code === NONE ? 1 : 0) : i;
  };
}

/**
 * Users per dimension, stacked by level. Levels are ordered, so they use
 * one hue from light to dark; "unknown" / "no quest" is neutral gray.
 */
function LevelStack({
  catalog,
  response,
  noneLabel,
}: {
  catalog: Catalog;
  response: InsightResponse;
  noneLabel: string;
}) {
  const levels = catalog.levels.map((l) => l.value);
  const extra = [
    ...new Set(
      response.rows
        .map((r) => r.group.level ?? NONE)
        .filter((level) => !levels.includes(level)),
    ),
  ];
  const keys = [...levels, ...extra];
  const config = Object.fromEntries(
    keys.map((key, i) => [
      key,
      {
        label:
          i < levels.length
            ? groupLabel(catalog, "level", key)
            : key === NONE
              ? noneLabel
              : groupLabel(catalog, "level", key),
        color:
          i < levels.length
            ? `color-mix(in oklab, var(--series-1) ${Math.round(35 + (65 * (i + 1)) / levels.length)}%, var(--card))`
            : OTHER_COLOR,
      },
    ]),
  ) satisfies ChartConfig;

  const position = dimensionOrder(catalog);
  const byDimension = new Map<string, Record<string, number>>();
  for (const r of response.rows) {
    const dimension = r.group.dimension ?? NONE;
    const entry = byDimension.get(dimension) ?? {};
    entry[r.group.level ?? NONE] = r.values.users ?? 0;
    byDimension.set(dimension, entry);
  }
  const data = [...byDimension.entries()]
    .sort(([a], [b]) => position(a) - position(b))
    .map(([dimension, counts]) => ({
      label:
        dimension === NONE
          ? noneLabel
          : groupLabel(catalog, "dimension", dimension),
      ...counts,
    }));

  return (
    <ChartContainer
      config={config}
      className="w-full"
      style={{ height: Math.max(180, data.length * 44 + 60) }}
    >
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
        <YAxis
          dataKey="label"
          type="category"
          width={130}
          tick={{ fontSize: 11 }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {keys.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="levels"
            fill={`var(--color-${key})`}
            stroke="var(--card)"
            strokeWidth={2}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

/** Additive weekly counts as lines, one per dimension (catalog colors). */
function WeeklyByDimension({
  catalog,
  response,
  value,
}: {
  catalog: Catalog;
  response: InsightResponse;
  value: string;
}) {
  // Colors follow the dimension's catalog position, not its rank.
  const shown = catalog.dimensions
    .slice(0, SERIES_COLORS.length)
    .map((d) => d.code);
  const present = new Set(response.rows.map((r) => r.group.dimension));
  const keys = shown.filter((code) => present.has(code));
  const hasOther = response.rows.some(
    (r) => !shown.includes(r.group.dimension ?? NONE),
  );
  if (hasOther) keys.push(OTHER_KEY);

  const config = Object.fromEntries(
    keys.map((key) => [
      key,
      {
        label:
          key === OTHER_KEY ? "Other" : groupLabel(catalog, "dimension", key),
        color:
          key === OTHER_KEY ? OTHER_COLOR : SERIES_COLORS[shown.indexOf(key)],
      },
    ]),
  ) satisfies ChartConfig;

  const byWeek = new Map<string, Record<string, number>>();
  for (const r of response.rows) {
    const code = r.group.dimension ?? NONE;
    const key = shown.includes(code) ? code : OTHER_KEY;
    const week = byWeek.get(r.group.week ?? "") ?? {};
    week[key] = (week[key] ?? 0) + (r.values[value] ?? 0);
    byWeek.set(r.group.week ?? "", week);
  }
  const data = weekStarts(response.meta).map((week) => ({
    week: formatWeek(week),
    ...Object.fromEntries(keys.map((k) => [k, byWeek.get(week)?.[k] ?? 0])),
  }));

  return (
    <ChartContainer config={config} className="h-[260px] w-full">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {keys.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
        {keys.map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}

/** Sum of an additive value per week as a single line. */
function WeeklyTotal({
  response,
  value,
  label,
}: {
  response: InsightResponse;
  value: string;
  label: string;
}) {
  const totals = new Map<string, number>();
  for (const r of response.rows) {
    const week = r.group.week ?? "";
    totals.set(week, (totals.get(week) ?? 0) + (r.values[value] ?? 0));
  }
  const data = weekStarts(response.meta).map((week) => ({
    week: formatWeek(week),
    total: totals.get(week) ?? 0,
  }));
  return (
    <ChartContainer
      config={{ total: { label, color: SERIES_COLORS[0] } }}
      className="h-[260px] w-full"
    >
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="total"
          stroke="var(--color-total)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

/** One bar per row of a single-group insight, in API order. */
function SingleBars({
  catalog,
  response,
  groupKey,
  value,
  label,
  horizontal = true,
}: {
  catalog: Catalog;
  response: InsightResponse;
  groupKey: string;
  value: string;
  label: string;
  horizontal?: boolean;
}) {
  const data = response.rows.map((r) => ({
    label: groupLabel(catalog, groupKey, r.group[groupKey] ?? null),
    value: r.values[value] ?? 0,
  }));
  const config = { value: { label, color: SERIES_COLORS[0] } };

  if (!horizontal) {
    return (
      <ChartContainer config={config} className="h-[260px] w-full">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="value"
            fill="var(--color-value)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    );
  }
  return (
    <div className="max-h-[360px] overflow-y-auto">
      <ChartContainer
        config={config}
        className="w-full"
        style={{ height: Math.max(160, data.length * 30 + 40) }}
      >
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
          <YAxis
            dataKey="label"
            type="category"
            width={150}
            tick={{ fontSize: 11 }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="value"
            fill="var(--color-value)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

// ── Cards ─────────────────────────────────────────────────

const QUEST_VALUES = [
  "users",
  "currentUsers",
  "startedUsers",
  "completedUsers",
  "avgProgress",
] as const;

const ITEM_VALUES = [
  "users",
  "activeUsers",
  "completedUsers",
  "completions",
  "completionsByRule",
  "completionsSelfReported",
  "failures",
  "failuresByUser",
  "failuresWithoutActivity",
  "avgProgress",
] as const;

/** Table-only insight with a rollup ("group by") control. */
function RollupPanel({
  catalog,
  breakdown,
  id,
  title,
  description,
  values,
  initialBy,
}: {
  catalog: Catalog;
  breakdown: string;
  id: string;
  title: string;
  description: string;
  values: readonly string[];
  initialBy: string;
}) {
  const [by, setBy] = useState(initialBy);
  return (
    <InsightPanel
      catalog={catalog}
      id={id}
      title={title}
      description={description}
      params={{ breakdown, by }}
      values={values}
      controls={
        <RollupButtons catalog={catalog} id={id} value={by} onChange={setBy} />
      }
    />
  );
}

function XpSourcesPanel({
  catalog,
  breakdown,
}: {
  catalog: Catalog;
  breakdown: string;
}) {
  const [by, setBy] = useState("sourceType");
  return (
    <InsightPanel
      catalog={catalog}
      id="xp-sources"
      title="XP Sources"
      description="Total XP credited, all time"
      params={{ breakdown, by }}
      values={["xp", "entries", "users"]}
      controls={
        <RollupButtons
          catalog={catalog}
          id="xp-sources"
          value={by}
          onChange={setBy}
        />
      }
      chart={(response) => (
        <SingleBars
          catalog={catalog}
          response={response}
          groupKey={by}
          value="xp"
          label="XP"
        />
      )}
    />
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-2 text-lg font-semibold tracking-tight">{children}</h3>
  );
}

// ── Main component ────────────────────────────────────────

/**
 * Live learning and gamification insights from the admin-only API: what
 * users learn (dimensions, quests, missions, quizzes, food facts) and what
 * they earn (badges, XP). Labels and options come from the catalog.
 */
export function LearningInsightsContent() {
  const catalogResult = useCatalog();
  const [breakdown, setBreakdown] = useState("");

  const heading = (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Learning Analytics</h2>
      <p className="text-muted-foreground">
        Live learning and gamification activity (admin only, not anonymised)
      </p>
    </div>
  );

  if (catalogResult.status !== "ok") {
    const status =
      catalogResult.status === "error" ? catalogResult.httpStatus : null;
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {heading}
        {catalogResult.status === "loading" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              {status === 401 ? (
                <>
                  <Link
                    href="/sign-in"
                    className="underline underline-offset-4"
                  >
                    Sign in
                  </Link>{" "}
                  with an admin account to see learning analytics.
                </>
              ) : status === 403 ? (
                "Learning analytics are only available to admins."
              ) : (
                "Could not load learning analytics."
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const catalog = catalogResult.data;
  const common = { catalog, breakdown };
  const params = { breakdown };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {heading}

      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-4">
        <div className="space-y-1">
          <Label htmlFor="learning-split" className="text-xs">
            Split by
          </Label>
          <select
            id="learning-split"
            className="flex h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={breakdown}
            onChange={(e) => setBreakdown(e.target.value)}
          >
            <option value="">Nothing (all users)</option>
            {catalog.breakdowns.map((b) => (
              <option key={b.key} value={b.key}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
        <p className="pb-1.5 text-xs text-muted-foreground">
          {breakdown
            ? `Every card shows a table split by ${columnLabel(catalog, breakdown).toLowerCase()}. Groups under ${catalog.minGroupSize} users are hidden.`
            : "Charts show all users. Pick a split to compare user groups."}
        </p>
      </div>

      <SectionTitle>Dimensions</SectionTitle>
      <div className="grid gap-4 lg:grid-cols-2">
        <InsightPanel
          catalog={catalog}
          id="dimension-levels"
          title="Dimension Levels"
          description="Users per learning dimension and current level"
          params={params}
          values={["users"]}
          chart={(response) => (
            <LevelStack
              catalog={catalog}
              response={response}
              noneLabel="No level"
            />
          )}
        />
        <InsightPanel
          catalog={catalog}
          id="dimension-focus"
          title="Current Focus"
          description="Dimension and level of each user's current quest"
          params={params}
          values={["users"]}
          chart={(response) => (
            <LevelStack
              catalog={catalog}
              response={response}
              noneLabel="No current quest"
            />
          )}
        />
      </div>
      <InsightPanel
        catalog={catalog}
        id="dimension-level-ups"
        title="Level-ups per Week"
        description={`Levels earned per dimension, last ${TREND_WEEKS} weeks; current week is partial`}
        params={{ ...params, weeks: TREND_WEEKS }}
        values={["levelUps", "users"]}
        chart={(response) => (
          <WeeklyByDimension
            catalog={catalog}
            response={response}
            value="levelUps"
          />
        )}
      />

      <SectionTitle>Quests, Missions &amp; Challenges</SectionTitle>
      <RollupPanel
        {...common}
        id="quest-progress"
        title="Quest Progress"
        description="Users per quest: current, started and completed"
        values={QUEST_VALUES}
        initialBy="level"
      />
      <RollupPanel
        {...common}
        id="mission-progress"
        title="Mission Progress"
        description="Assigned, active, completed and failed missions"
        values={ITEM_VALUES}
        initialBy="level"
      />
      <RollupPanel
        {...common}
        id="challenge-progress"
        title="Challenge Progress"
        description="Assigned, active, completed and failed challenges"
        values={ITEM_VALUES}
        initialBy="level"
      />

      <SectionTitle>Quizzes &amp; Food Facts</SectionTitle>
      <div className="grid gap-4 lg:grid-cols-2">
        <RollupPanel
          {...common}
          id="quiz-results"
          title="Quiz Results"
          description="Answered quizzes and share answered correctly"
          values={["users", "answers", "correctAnswers", "correctRate"]}
          initialBy="topic"
        />
        <RollupPanel
          {...common}
          id="food-facts-read"
          title="Food Facts Read"
          description="Readers and read facts"
          values={["users", "reads"]}
          initialBy="topic"
        />
      </div>

      <SectionTitle>Badges &amp; XP</SectionTitle>
      <div className="grid gap-4 lg:grid-cols-2">
        <InsightPanel
          catalog={catalog}
          id="badges"
          title="Badges"
          description="Users holding each badge"
          params={params}
          values={["users"]}
          chart={(response) => (
            <SingleBars
              catalog={catalog}
              response={response}
              groupKey="badge"
              value="users"
              label="Users"
            />
          )}
        />
        <InsightPanel
          catalog={catalog}
          id="badge-earns"
          title="Badges Earned per Week"
          description={`All badges, last ${TREND_WEEKS} weeks; current week is partial`}
          params={{ ...params, weeks: TREND_WEEKS }}
          values={["users"]}
          chart={(response) => (
            <WeeklyTotal
              response={response}
              value="users"
              label="Badges earned"
            />
          )}
        />
        <InsightPanel
          catalog={catalog}
          id="xp-distribution"
          title="XP Balance"
          description="Users per current XP balance"
          params={params}
          values={["users"]}
          chart={(response) => (
            <SingleBars
              catalog={catalog}
              response={response}
              groupKey="bucket"
              value="users"
              label="Users"
              horizontal={false}
            />
          )}
        />
        <XpSourcesPanel {...common} />
      </div>
    </div>
  );
}
