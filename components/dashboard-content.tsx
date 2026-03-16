"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Utensils, Flame, Globe } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
} from "recharts";
import MapLibreGL from "maplibre-gl";
import { Map, useMap } from "@/components/ui/map";
import {
  analyticsApi,
  type DailyNutrition,
  type DemographicNutrition,
  DIMENSION_LABELS,
} from "@/lib/analytics-api";

// ── Country ISO-2 → ISO-3 / display name mapping ─────────

const COUNTRY_INFO: Record<string, { iso3: string; name: string }> = {
  AT: { iso3: "AUT", name: "Austria" },
  BE: { iso3: "BEL", name: "Belgium" },
  BG: { iso3: "BGR", name: "Bulgaria" },
  CH: { iso3: "CHE", name: "Switzerland" },
  CY: { iso3: "CYP", name: "Cyprus" },
  CZ: { iso3: "CZE", name: "Czech Republic" },
  DE: { iso3: "DEU", name: "Germany" },
  DK: { iso3: "DNK", name: "Denmark" },
  EE: { iso3: "EST", name: "Estonia" },
  ES: { iso3: "ESP", name: "Spain" },
  FI: { iso3: "FIN", name: "Finland" },
  FR: { iso3: "FRA", name: "France" },
  GB: { iso3: "GBR", name: "United Kingdom" },
  GR: { iso3: "GRC", name: "Greece" },
  HR: { iso3: "HRV", name: "Croatia" },
  HU: { iso3: "HUN", name: "Hungary" },
  IE: { iso3: "IRL", name: "Ireland" },
  IT: { iso3: "ITA", name: "Italy" },
  LT: { iso3: "LTU", name: "Lithuania" },
  LU: { iso3: "LUX", name: "Luxembourg" },
  LV: { iso3: "LVA", name: "Latvia" },
  MT: { iso3: "MLT", name: "Malta" },
  NL: { iso3: "NLD", name: "Netherlands" },
  NO: { iso3: "NOR", name: "Norway" },
  PL: { iso3: "POL", name: "Poland" },
  PT: { iso3: "PRT", name: "Portugal" },
  RO: { iso3: "ROU", name: "Romania" },
  RS: { iso3: "SRB", name: "Serbia" },
  SE: { iso3: "SWE", name: "Sweden" },
  SI: { iso3: "SVN", name: "Slovenia" },
  SK: { iso3: "SVK", name: "Slovakia" },
  TR: { iso3: "TUR", name: "Turkey" },
  UA: { iso3: "UKR", name: "Ukraine" },
};

// ── Choropleth layer component ────────────────────────────

function CountryChoropleth({
  data,
}: {
  data: { country: string; users: number; code: string }[];
}) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || data.length === 0) return;

    const sourceId = "countries-choropleth";
    const fillLayerId = "countries-fill";
    const borderLayerId = "countries-border";

    // Build a lookup for quick hover access
    const lookup = new globalThis.Map(data.map((d) => [d.code, d] as const));
    const nameLookup = new globalThis.Map(
      data.map((d) => [d.country, d] as const),
    );

    function addLayers() {
      if (!map || !map.isStyleLoaded()) return;

      const isDark = document.documentElement.classList.contains("dark");
      const maxUsers = Math.max(...data.map((d) => d.users));

      const getColor = (users: number) => {
        const intensity = users / maxUsers;
        if (isDark) {
          const lightness = 35 + intensity * 30;
          return `hsl(192, 70%, ${lightness}%)`;
        } else {
          const lightness = 50 - intensity * 30;
          return `hsl(192, 60%, ${lightness}%)`;
        }
      };

      const colorExpression: unknown[] = [
        "case",
        ...data.flatMap((d) => [
          ["==", ["get", "ADM0_A3"], d.code],
          getColor(d.users),
          ["==", ["get", "NAME"], d.country],
          getColor(d.users),
        ]),
        isDark ? "rgba(100, 100, 100, 0.1)" : "rgba(230, 230, 230, 0.15)",
      ];

      // Find the first symbol (label) layer so we insert below labels
      const layers = map.getStyle().layers ?? [];
      let firstSymbolId: string | undefined;
      for (const layer of layers) {
        if (layer.type === "symbol") {
          firstSymbolId = layer.id;
          break;
        }
      }

      // Add source
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "vector",
          url: "https://demotiles.maplibre.org/tiles/tiles.json",
        });
      }

      // Add fill layer (below labels, above basemap land)
      if (!map.getLayer(fillLayerId)) {
        map.addLayer(
          {
            id: fillLayerId,
            type: "fill",
            source: sourceId,
            "source-layer": "countries",
            paint: {
              "fill-color": colorExpression as never,
              "fill-opacity": 0.8,
            },
          },
          firstSymbolId,
        );
      } else {
        map.setPaintProperty(
          fillLayerId,
          "fill-color",
          colorExpression as never,
        );
      }

      // Add subtle borders
      if (!map.getLayer(borderLayerId)) {
        map.addLayer(
          {
            id: borderLayerId,
            type: "line",
            source: sourceId,
            "source-layer": "countries",
            paint: {
              "line-color": isDark
                ? "rgba(200, 200, 200, 0.3)"
                : "rgba(100, 100, 100, 0.25)",
              "line-width": 0.5,
            },
          },
          firstSymbolId,
        );
      }
    }

    // Add layers now if map is ready, and re-add after any style change
    if (isLoaded) addLayers();

    const handleStyleData = () => {
      // Wait a tick for the style to fully settle before re-adding layers
      setTimeout(() => addLayers(), 150);
    };
    map.on("styledata", handleStyleData);

    // ── Hover popup ───────────────────────────────────────
    const popup = new MapLibreGL.Popup({
      closeButton: false,
      closeOnClick: false,
      className: "country-popup",
    });

    const handleMouseMove = (
      e: MapLibreGL.MapMouseEvent & {
        features?: MapLibreGL.MapGeoJSONFeature[];
      },
    ) => {
      if (!e.features || e.features.length === 0) return;

      const props = e.features[0].properties;
      const code = props?.ADM0_A3 as string | undefined;
      const name = props?.NAME as string | undefined;

      const entry =
        (code && lookup.get(code)) || (name && nameLookup.get(name));

      if (entry) {
        map.getCanvas().style.cursor = "pointer";
        const isDarkNow = document.documentElement.classList.contains("dark");
        const bg = isDarkNow ? "hsl(220, 14%, 16%)" : "hsl(0, 0%, 100%)";
        const fg = isDarkNow ? "hsl(210, 20%, 90%)" : "hsl(220, 14%, 16%)";
        const border = isDarkNow
          ? "hsl(220, 14%, 25%)"
          : "hsl(220, 14%, 85%)";
        popup
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="padding:6px 10px;font-size:13px;line-height:1.5;background:${bg};color:${fg};border:1px solid ${border};border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15)">` +
              `<strong>${entry.country}</strong><br/>` +
              `<span>👥 ${entry.users.toLocaleString()} users</span>` +
              `</div>`,
          )
          .addTo(map);
      } else {
        popup.remove();
        map.getCanvas().style.cursor = "";
      }
    };

    const handleMouseLeave = () => {
      popup.remove();
      map.getCanvas().style.cursor = "";
    };

    map.on("mousemove", fillLayerId, handleMouseMove);
    map.on("mouseleave", fillLayerId, handleMouseLeave);

    return () => {
      popup.remove();
      map.off("styledata", handleStyleData);
      map.off("mousemove", fillLayerId, handleMouseMove);
      map.off("mouseleave", fillLayerId, handleMouseLeave);
      try {
        if (map.getLayer(borderLayerId)) map.removeLayer(borderLayerId);
        if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // ignore
      }
    };
  }, [map, isLoaded, data]);

  return null;
}

// ── Pie chart colors ──────────────────────────────────────

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

// ── Main component ────────────────────────────────────────

export function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [nutrition, setNutrition] = useState<DailyNutrition[]>([]);
  const [countryData, setCountryData] = useState<DemographicNutrition[]>([]);
  const [ageData, setAgeData] = useState<DemographicNutrition[]>([]);
  const [genderData, setGenderData] = useState<DemographicNutrition[]>([]);
  const [educationData, setEducationData] = useState<DemographicNutrition[]>(
    [],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [nutr, byCountry, byAge, byGender, byEdu] = await Promise.all([
        analyticsApi.nutrition(),
        analyticsApi.demographicNutrition({ dimension: "country" }),
        analyticsApi.demographicNutrition({ dimension: "ageGroup" }),
        analyticsApi.demographicNutrition({ dimension: "gender" }),
        analyticsApi.demographicNutrition({ dimension: "educationLevel" }),
      ]);
      setNutrition(nutr);
      setCountryData(byCountry);
      setAgeData(byAge);
      setGenderData(byGender);
      setEducationData(byEdu);
      console.log("[Dashboard] Fetched data:", {
        nutrition: nutr.length,
        countries: byCountry.length,
        age: byAge.length,
        gender: byGender.length,
        edu: byEdu.length,
        sampleCountry: byCountry[0],
      });
    } catch (e) {
      console.error("Failed to fetch dashboard data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Derived metrics ───────────────────────────────────────

  // Total unique users — max userCount across all rows (users are counted per day/mealType)
  const totalUsers = nutrition.reduce(
    (max, r) => Math.max(max, r.userCount),
    0,
  );

  // Total meals
  const totalMeals = nutrition.reduce((s, r) => s + r.mealCount, 0);

  // Total calories recorded (avgCalories × mealCount per row)
  const totalCalories = nutrition.reduce(
    (s, r) => s + (r.avgCalories ?? 0) * r.mealCount,
    0,
  );

  // Countries with data (API returns ISO-2 codes like "DE", "ES", etc.)
  const countryAgg: Record<string, number> = {};
  for (const r of countryData) {
    const iso2 = r.country ?? "Unknown";
    countryAgg[iso2] = Math.max(countryAgg[iso2] ?? 0, r.userCount);
  }
  const countriesCount = Object.keys(countryAgg).filter(
    (c) => c !== "Unknown" && c !== "__null__",
  ).length;

  // Meals by type
  const mealsByType: Record<string, number> = {};
  for (const r of nutrition) {
    const label =
      r.typeOfMeal.charAt(0) +
      r.typeOfMeal.slice(1).toLowerCase().replace("_", " ");
    mealsByType[label] = (mealsByType[label] ?? 0) + r.mealCount;
  }
  const mealTypeChart = Object.entries(mealsByType)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // Country choropleth data — map ISO-2 → ISO-3 + display name
  const countryChoro = Object.entries(countryAgg)
    .filter(([c]) => c !== "Unknown" && c !== "__null__")
    .map(([iso2, users]) => {
      const info = COUNTRY_INFO[iso2];
      return {
        country: info?.name ?? iso2,
        users,
        code: info?.iso3 ?? iso2,
      };
    })
    .sort((a, b) => b.users - a.users);

  console.log("[Dashboard] countryChoro:", countryChoro);

  // Demographic aggregations helper
  function aggregateDemographic(
    rows: DemographicNutrition[],
    dimKey: keyof DemographicNutrition,
  ) {
    const agg: Record<string, number> = {};
    for (const r of rows) {
      const val = (r[dimKey] as string) ?? "Unknown";
      const label = val === "__null__" ? "Not specified" : val;
      agg[label] = Math.max(agg[label] ?? 0, r.userCount);
    }
    return Object.entries(agg)
      .map(([label, users]) => ({ label, users }))
      .sort((a, b) => b.users - a.users);
  }

  const ageChart = aggregateDemographic(ageData, "ageGroup");
  const genderChart = aggregateDemographic(genderData, "gender");
  const educationChart = aggregateDemographic(educationData, "educationLevel");

  // ── Render ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  const noData = nutrition.length === 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          FOODMISSION Overview
        </h2>
        <p className="text-muted-foreground">
          Real-time analytics from published aggregation data
        </p>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total Users</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique users in published data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total Meals</CardDescription>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalMeals.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {mealTypeChart.length} meal types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total Calories Recorded</CardDescription>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCalories >= 1_000_000
                ? `${(totalCalories / 1_000_000).toFixed(1)}M`
                : totalCalories.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              kcal total across all meals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Countries</CardDescription>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {countriesCount} {countriesCount === 1 ? "Country" : "Countries"}
            </div>
            <p className="text-xs text-muted-foreground">
              With published analytics data
            </p>
          </CardContent>
        </Card>
      </div>

      {noData ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">
              No published analytics data available yet. Run an aggregation
              batch and publish it to see data here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Map + Users by Country ──────────────────────── */}
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="md:col-span-4 p-0 overflow-hidden min-h-[400px]">
              <Map
                center={[10, 50]}
                zoom={3.5}
                projection={{ type: "mercator" }}
              >
                <CountryChoropleth data={countryChoro} />
              </Map>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Users by Country</CardTitle>
                <CardDescription>
                  Max concurrent users per country
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    users: { label: "Users", color: "var(--chart-1)" },
                  }}
                  className="h-[300px]"
                >
                  <BarChart data={countryChoro} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      dataKey="country"
                      type="category"
                      width={100}
                      tick={{ fontSize: 11 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="users"
                      fill="var(--chart-1)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* ── Meals by Type ──────────────────────────────── */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Meals by Type</CardTitle>
                <CardDescription>
                  Total recorded meals grouped by meal type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={Object.fromEntries(
                    mealTypeChart.map((d, i) => [
                      d.type,
                      {
                        label: d.type,
                        color: PIE_COLORS[i % PIE_COLORS.length],
                      },
                    ]),
                  )}
                  className="h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={mealTypeChart}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={2}
                      label={({ type, count }) =>
                        `${type}: ${count.toLocaleString()}`
                      }
                    >
                      {mealTypeChart.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                {totalMeals.toLocaleString()} meals total
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meal Count Breakdown</CardTitle>
                <CardDescription>Exact counts per meal type</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: { label: "Meals", color: "var(--chart-2)" },
                  }}
                  className="h-[300px]"
                >
                  <BarChart data={mealTypeChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="count"
                      fill="var(--chart-2)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* ── Demographics ───────────────────────────────── */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Users by Demographics
            </h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Age Group */}
            {ageChart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{DIMENSION_LABELS.ageGroup}</CardTitle>
                  <CardDescription>Users per age group</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      users: { label: "Users", color: "var(--chart-3)" },
                    }}
                    className="h-[250px]"
                  >
                    <BarChart data={ageChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="users"
                        fill="var(--chart-3)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Gender */}
            {genderChart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{DIMENSION_LABELS.gender}</CardTitle>
                  <CardDescription>Users per gender</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={Object.fromEntries(
                      genderChart.map((d, i) => [
                        d.label,
                        {
                          label: d.label,
                          color: PIE_COLORS[i % PIE_COLORS.length],
                        },
                      ]),
                    )}
                    className="h-[250px]"
                  >
                    <PieChart>
                      <Pie
                        data={genderChart}
                        dataKey="users"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        label={({ label, users }) => `${label}: ${users}`}
                      >
                        {genderChart.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Education Level */}
            {educationChart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{DIMENSION_LABELS.educationLevel}</CardTitle>
                  <CardDescription>Users per education level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      users: { label: "Users", color: "var(--chart-4)" },
                    }}
                    className="h-[250px]"
                  >
                    <BarChart data={educationChart} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        dataKey="label"
                        type="category"
                        width={120}
                        tick={{ fontSize: 10 }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="users"
                        fill="var(--chart-4)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
