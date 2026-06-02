"use client";

import { useEffect } from "react";
import MapLibreGL from "maplibre-gl";
import { useMap } from "@/components/ui/map";

export interface ChoroplethEntry {
  country: string;
  users: number;
  code: string;
}

export function CountryChoropleth({ data }: { data: ChoroplethEntry[] }) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || data.length === 0) return;

    const sourceId = "countries-choropleth";
    const fillLayerId = "countries-fill";
    const borderLayerId = "countries-border";

    const lookup = new globalThis.Map(data.map((d) => [d.code, d] as const));
    const nameLookup = new globalThis.Map(data.map((d) => [d.country, d] as const));

    function addLayers() {
      if (!map || !map.isStyleLoaded()) return;

      const isDark = document.documentElement.classList.contains("dark");
      const maxUsers = Math.max(...data.map((d) => d.users));

      const getColor = (users: number) => {
        const intensity = users / maxUsers;
        if (isDark) {
          return `hsl(192, 70%, ${35 + intensity * 30}%)`;
        }
        return `hsl(192, 60%, ${50 - intensity * 30}%)`;
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

      const layers = map.getStyle().layers ?? [];
      let firstSymbolId: string | undefined;
      for (const layer of layers) {
        if (layer.type === "symbol") {
          firstSymbolId = layer.id;
          break;
        }
      }

      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "vector",
          url: "https://demotiles.maplibre.org/tiles/tiles.json",
        });
      }

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
        map.setPaintProperty(fillLayerId, "fill-color", colorExpression as never);
      }

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

    if (isLoaded) addLayers();

    const handleStyleData = () => setTimeout(() => addLayers(), 150);
    map.on("styledata", handleStyleData);

    const popup = new MapLibreGL.Popup({
      closeButton: false,
      closeOnClick: false,
      className: "country-popup",
    });

    const handleMouseMove = (
      e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] },
    ) => {
      if (!e.features || e.features.length === 0) return;

      const props = e.features[0].properties;
      const code = props?.ADM0_A3 as string | undefined;
      const name = props?.NAME as string | undefined;
      const entry = (code && lookup.get(code)) || (name && nameLookup.get(name));

      if (entry) {
        map.getCanvas().style.cursor = "pointer";
        const isDarkNow = document.documentElement.classList.contains("dark");
        const bg = isDarkNow ? "hsl(220, 14%, 16%)" : "hsl(0, 0%, 100%)";
        const fg = isDarkNow ? "hsl(210, 20%, 90%)" : "hsl(220, 14%, 16%)";
        const border = isDarkNow ? "hsl(220, 14%, 25%)" : "hsl(220, 14%, 85%)";

        const container = document.createElement("div");
        container.style.cssText = `padding:6px 10px;font-size:13px;line-height:1.5;background:${bg};color:${fg};border:1px solid ${border};border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15)`;
        const strong = document.createElement("strong");
        strong.textContent = entry.country;
        const br = document.createElement("br");
        const span = document.createElement("span");
        span.textContent = `👥 ${entry.users.toLocaleString()} users`;
        container.appendChild(strong);
        container.appendChild(br);
        container.appendChild(span);

        popup
          .setLngLat(e.lngLat)
          .setDOMContent(container)
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
