"use client";

import { useEffect, useRef, useState } from "react";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{
    name: string;
    x: number;
    y: number;
  } | null>(null);
  const rotationRef = useRef<[number, number, number]>([0, -20, 0]);
  const dragStartRef = useRef<{ x: number; y: number; rotation: [number, number, number] } | null>(null);
  const animationRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const countriesRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  const hoveredIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { width: rect.width, height: rect.height };
    }

    let { width, height } = resize();
    const scale = Math.min(width, height) / 2.2;

    const projection = d3
      .geoOrthographic()
      .scale(scale)
      .translate([width / 2, height / 2])
      .rotate(rotationRef.current);

    projectionRef.current = projection;
    const path = d3.geoPath().projection(projection).context(ctx);
    const graticule = d3.geoGraticule()();

    function draw() {
      const countries = countriesRef.current;
      if (!countries) return;
      const hoveredId = hoveredIdRef.current;

      ctx.clearRect(0, 0, width, height);

      // Ocean
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, projection.scale()!, 0, 2 * Math.PI);
      ctx.fillStyle = "#1e3a5f";
      ctx.fill();
      ctx.strokeStyle = "#2d5a8e";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Graticule
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = "#2d5a8e";
      ctx.lineWidth = 0.3;
      ctx.stroke();

      // Countries
      for (const f of countries.features) {
        const id = numericToId[f.id as string];
        ctx.beginPath();
        path(f as d3.GeoPermissibleObjects);

        if (hoveredId === f.id) {
          ctx.fillStyle = "#fbbf24";
          ctx.globalAlpha = 1;
        } else if (id) {
          ctx.fillStyle = "#22d3ee";
          ctx.globalAlpha = 0.85;
        } else {
          ctx.fillStyle = "#4a7c59";
          ctx.globalAlpha = 0.6;
        }

        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    fetch("/world-110m.json")
      .then((res) => res.json())
      .then((topology: Topology) => {
        const geom = topology.objects.countries as GeometryCollection;
        countriesRef.current = feature(topology, geom) as unknown as GeoJSON.FeatureCollection;
        draw();
        autoRotate();
      });

    let lastMouseX = -1;
    let lastMouseY = -1;

    function autoRotate() {
      if (!isDraggingRef.current) {
        rotationRef.current = [
          rotationRef.current[0] + 0.3,
          rotationRef.current[1],
          rotationRef.current[2],
        ];
        projection.rotate(rotationRef.current);
        // Re-check hover under current mouse position as globe rotates
        if (lastMouseX >= 0 && hoveredIdRef.current) {
          const found = findCountryAtPoint(lastMouseX, lastMouseY);
          if (!found || found.id !== hoveredIdRef.current) {
            hoveredIdRef.current = undefined;
            setTooltip(null);
          }
        }
        draw();
      }
      animationRef.current = requestAnimationFrame(autoRotate);
    }

    function findCountryAtPoint(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const coords = projection.invert?.([x, y]);
      if (!coords || !countriesRef.current) return null;
      const found = countriesRef.current.features.find((f) =>
        d3.geoContains(f as d3.GeoPermissibleObjects, coords)
      );
      return found || null;
    }

    // Mouse events
    function handleMouseDown(e: MouseEvent) {
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        rotation: [...rotationRef.current] as [number, number, number],
      };
    }

    function handleMouseMove(e: MouseEvent) {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
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
        draw();
      }

      // Tooltip
      const found = findCountryAtPoint(e.clientX, e.clientY);
      if (found && numericToId[found.id as string]) {
        const countryData = countriesData[numericToId[found.id as string] as keyof typeof countriesData];
        hoveredIdRef.current = found.id as string;
        setTooltip({ name: countryData.name, x: e.clientX, y: e.clientY });
      } else {
        if (hoveredIdRef.current) {
          hoveredIdRef.current = undefined;
          setTooltip(null);
        }
      }
    }

    function handleMouseUp(e: MouseEvent) {
      if (isDraggingRef.current && dragStartRef.current) {
        const dx = Math.abs(e.clientX - dragStartRef.current.x);
        const dy = Math.abs(e.clientY - dragStartRef.current.y);
        if (dx < 5 && dy < 5) {
          const found = findCountryAtPoint(e.clientX, e.clientY);
          if (found && numericToId[found.id as string]) {
            onCountryClick(numericToId[found.id as string]);
          }
        }
      }
      isDraggingRef.current = false;
      dragStartRef.current = null;
    }

    function handleMouseLeave() {
      isDraggingRef.current = false;
      dragStartRef.current = null;
      hoveredIdRef.current = undefined;
      lastMouseX = -1;
      lastMouseY = -1;
      setTooltip(null);
    }

    // Touch events
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
        draw();
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      if (isDraggingRef.current && dragStartRef.current && e.changedTouches[0]) {
        const touch = e.changedTouches[0];
        const dx = Math.abs(touch.clientX - dragStartRef.current.x);
        const dy = Math.abs(touch.clientY - dragStartRef.current.y);
        if (dx < 10 && dy < 10) {
          const found = findCountryAtPoint(touch.clientX, touch.clientY);
          if (found && numericToId[found.id as string]) {
            onCountryClick(numericToId[found.id as string]);
          }
        }
      }
      isDraggingRef.current = false;
      dragStartRef.current = null;
    }

    function handleResize() {
      ({ width, height } = resize());
      projection.scale(Math.min(width, height) / 2.2).translate([width / 2, height / 2]);
      draw();
    }

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", handleResize);
    };
  }, [onCountryClick]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
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
        Drag to spin &bull; Tap a highlighted country to explore
      </div>
    </div>
  );
}
