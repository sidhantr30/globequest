"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import countriesData from "@/data/countries.json";

interface GlobeProps {
  onCountryClick: (countryId: string) => void;
}

// Map numeric country codes to our country IDs
const numericToId: Record<string, string> = {};
for (const [id, data] of Object.entries(countriesData)) {
  numericToId[data.numericCode] = id;
}

export default function Globe({ onCountryClick }: GlobeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    name: string;
    x: number;
    y: number;
  } | null>(null);
  const rotationRef = useRef<[number, number, number]>([0, -20, 0]);
  const dragStartRef = useRef<{ x: number; y: number; rotation: [number, number, number] } | null>(null);
  const animationRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const draw = useCallback(
    (
      svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
      countries: GeoJSON.FeatureCollection,
      projection: d3.GeoProjection,
      path: d3.GeoPath,
      hoveredId?: string
    ) => {
      svg.selectAll("*").remove();
      const width = svg.node()!.clientWidth;
      const height = svg.node()!.clientHeight;

      // Ocean
      svg
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", projection.scale()!)
        .attr("fill", "#1e3a5f")
        .attr("stroke", "#2d5a8e")
        .attr("stroke-width", 1.5);

      // Graticule (grid lines)
      const graticule = d3.geoGraticule();
      svg
        .append("path")
        .datum(graticule())
        .attr("d", path as never)
        .attr("fill", "none")
        .attr("stroke", "#2d5a8e")
        .attr("stroke-width", 0.3);

      // Countries
      svg
        .selectAll(".country")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path as never)
        .attr("fill", (d) => {
          const id = numericToId[d.id as string];
          if (hoveredId === d.id) return "#fbbf24";
          if (id) return "#22d3ee";
          return "#4a7c59";
        })
        .attr("stroke", "#0f172a")
        .attr("stroke-width", 0.5)
        .attr("cursor", (d) => (numericToId[d.id as string] ? "pointer" : "default"))
        .attr("opacity", (d) => {
          if (hoveredId === d.id) return 1;
          if (numericToId[d.id as string]) return 0.85;
          return 0.6;
        });
    },
    []
  );

  useEffect(() => {
    const svg = d3.select(svgRef.current!);
    const width = svgRef.current!.clientWidth;
    const height = svgRef.current!.clientHeight;
    const scale = Math.min(width, height) / 2.2;

    const projection = d3
      .geoOrthographic()
      .scale(scale)
      .translate([width / 2, height / 2])
      .rotate(rotationRef.current);

    const path = d3.geoPath().projection(projection);

    let countries: GeoJSON.FeatureCollection;
    let hoveredCountryId: string | undefined;

    fetch("/world-110m.json")
      .then((res) => res.json())
      .then((topology: Topology) => {
        const geom = topology.objects.countries as GeometryCollection;
        countries = feature(topology, geom) as unknown as GeoJSON.FeatureCollection;
        draw(svg, countries, projection, path);
        autoRotate();
      });

    function autoRotate() {
      if (isDraggingRef.current) {
        animationRef.current = requestAnimationFrame(autoRotate);
        return;
      }
      rotationRef.current = [
        rotationRef.current[0] + 0.3,
        rotationRef.current[1],
        rotationRef.current[2],
      ];
      projection.rotate(rotationRef.current);
      if (countries) draw(svg, countries, projection, path, hoveredCountryId);
      animationRef.current = requestAnimationFrame(autoRotate);
    }

    // Mouse events
    const svgEl = svgRef.current!;

    function handleMouseDown(e: MouseEvent) {
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        rotation: [...rotationRef.current] as [number, number, number],
      };
    }

    function handleMouseMove(e: MouseEvent) {
      if (isDraggingRef.current && dragStartRef.current) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        const sensitivity = 0.3;
        rotationRef.current = [
          dragStartRef.current.rotation[0] + dx * sensitivity,
          Math.max(-90, Math.min(90, dragStartRef.current.rotation[1] - dy * sensitivity)),
          dragStartRef.current.rotation[2],
        ];
        projection.rotate(rotationRef.current);
        if (countries) draw(svg, countries, projection, path, hoveredCountryId);
      }

      // Tooltip
      const rect = svgEl.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const coords = projection.invert?.([mouseX, mouseY]);
      if (coords && countries) {
        const found = countries.features.find((f) => {
          return d3.geoContains(f as d3.GeoPermissibleObjects, coords);
        });
        if (found && numericToId[found.id as string]) {
          const countryData = countriesData[numericToId[found.id as string] as keyof typeof countriesData];
          hoveredCountryId = found.id as string;
          setTooltip({ name: countryData.name, x: e.clientX, y: e.clientY });
          if (!isDraggingRef.current) {
            draw(svg, countries, projection, path, hoveredCountryId);
          }
        } else {
          if (hoveredCountryId) {
            hoveredCountryId = undefined;
            setTooltip(null);
            if (!isDraggingRef.current) {
              draw(svg, countries, projection, path);
            }
          }
        }
      }
    }

    function handleMouseUp(e: MouseEvent) {
      if (isDraggingRef.current && dragStartRef.current) {
        const dx = Math.abs(e.clientX - dragStartRef.current.x);
        const dy = Math.abs(e.clientY - dragStartRef.current.y);
        // If barely moved, treat as click
        if (dx < 5 && dy < 5) {
          const rect = svgEl.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const coords = projection.invert?.([mouseX, mouseY]);
          if (coords && countries) {
            const found = countries.features.find((f) =>
              d3.geoContains(f as d3.GeoPermissibleObjects, coords)
            );
            if (found && numericToId[found.id as string]) {
              onCountryClick(numericToId[found.id as string]);
            }
          }
        }
      }
      isDraggingRef.current = false;
      dragStartRef.current = null;
    }

    function handleMouseLeave() {
      isDraggingRef.current = false;
      dragStartRef.current = null;
      hoveredCountryId = undefined;
      setTooltip(null);
    }

    svgEl.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    svgEl.addEventListener("mouseleave", handleMouseLeave);

    // Touch events for mobile
    function handleTouchStart(e: TouchEvent) {
      const touch = e.touches[0];
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        rotation: [...rotationRef.current] as [number, number, number],
      };
    }

    function handleTouchMove(e: TouchEvent) {
      e.preventDefault();
      const touch = e.touches[0];
      if (isDraggingRef.current && dragStartRef.current) {
        const dx = touch.clientX - dragStartRef.current.x;
        const dy = touch.clientY - dragStartRef.current.y;
        const sensitivity = 0.3;
        rotationRef.current = [
          dragStartRef.current.rotation[0] + dx * sensitivity,
          Math.max(-90, Math.min(90, dragStartRef.current.rotation[1] - dy * sensitivity)),
          dragStartRef.current.rotation[2],
        ];
        projection.rotate(rotationRef.current);
        if (countries) draw(svg, countries, projection, path);
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      if (isDraggingRef.current && dragStartRef.current && e.changedTouches[0]) {
        const touch = e.changedTouches[0];
        const dx = Math.abs(touch.clientX - dragStartRef.current.x);
        const dy = Math.abs(touch.clientY - dragStartRef.current.y);
        if (dx < 10 && dy < 10) {
          const rect = svgEl.getBoundingClientRect();
          const mouseX = touch.clientX - rect.left;
          const mouseY = touch.clientY - rect.top;
          const coords = projection.invert?.([mouseX, mouseY]);
          if (coords && countries) {
            const found = countries.features.find((f) =>
              d3.geoContains(f as d3.GeoPermissibleObjects, coords)
            );
            if (found && numericToId[found.id as string]) {
              onCountryClick(numericToId[found.id as string]);
            }
          }
        }
      }
      isDraggingRef.current = false;
      dragStartRef.current = null;
    }

    svgEl.addEventListener("touchstart", handleTouchStart, { passive: false });
    svgEl.addEventListener("touchmove", handleTouchMove, { passive: false });
    svgEl.addEventListener("touchend", handleTouchEnd);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      svgEl.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      svgEl.removeEventListener("mouseleave", handleMouseLeave);
      svgEl.removeEventListener("touchstart", handleTouchStart);
      svgEl.removeEventListener("touchmove", handleTouchMove);
      svgEl.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onCountryClick, draw]);

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ touchAction: "none" }}
      />
      {tooltip && (
        <div
          className="fixed pointer-events-none bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg border border-cyan-500/50 z-50"
          style={{ left: tooltip.x + 15, top: tooltip.y - 10 }}
        >
          {tooltip.name}
        </div>
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-400 text-sm">
        Drag to spin &bull; Click a highlighted country to explore
      </div>
    </div>
  );
}
