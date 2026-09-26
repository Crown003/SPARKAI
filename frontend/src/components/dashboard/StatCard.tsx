"use client";

import React from "react";
import {
  FolderKanban,
  ShieldAlert,
  FileText,
  PieChart,
  ChevronRight,
} from "lucide-react";
import { MetricCardData } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  folder: FolderKanban,
  "shield-alert": ShieldAlert,
  "file-text": FileText,
  "pie-chart": PieChart,
};

const themeConfigs = {
  emerald: {
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    stroke: "#10b981",
    fill: "#10b981",
    badgeBg: "text-emerald-600",
  },
  rose: {
    iconBg: "bg-rose-50 text-rose-500 border-rose-100",
    stroke: "#ef4444",
    fill: "#ef4444",
    badgeBg: "text-rose-600",
  },
  green: {
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    stroke: "#10b981",
    fill: "#10b981",
    badgeBg: "text-emerald-600",
  },
  purple: {
    iconBg: "bg-purple-50 text-purple-600 border-purple-100",
    stroke: "#8b5cf6",
    fill: "#8b5cf6",
    badgeBg: "text-purple-600",
  },
};

interface StatCardProps {
  card: MetricCardData;
  onClick?: () => void;
}

export default function StatCard({ card, onClick }: StatCardProps) {
  const Icon = iconMap[card.icon] || FolderKanban;
  const theme = themeConfigs[card.color];

  // Generate SVG path for the sparkline
  const points = card.sparkline;
  const minVal = Math.min(...points);
  const maxVal = Math.max(...points);
  const range = maxVal - minVal || 1;
  const width = 220;
  const height = 44;
  const padding = 6;

  const svgPoints = points.map((val, idx) => {
    const x = padding + (idx / (points.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
    return { x, y };
  });

  const pathD = svgPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, "");

  return (
    <div
      onClick={onClick}
      className="group relative bg-white border border-slate-100/90 rounded-3xl p-5 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Header: Icon, Title & Chevron */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-8 w-8 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105",
                theme.iconBg
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-700">
              {card.title}
            </span>
          </div>

          <div className="h-6 w-6 rounded-full flex items-center justify-center text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all">
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* Big Metric Number */}
        <div className="space-y-1 mb-2">
          <div className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
            {card.count}
          </div>
          <div className={cn("text-[11px] font-medium flex items-center gap-1", theme.badgeBg)}>
            <span>{card.change}</span>
          </div>
        </div>
      </div>

      {/* Sparkline Visual Curve */}
      <div className="w-full pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-11 overflow-visible"
        >
          {/* Smooth line */}
          <path
            d={pathD}
            fill="none"
            stroke={theme.stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-500"
          />
          {/* Sparkline Points */}
          {svgPoints.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="2.2"
              fill={theme.fill}
              className="transition-transform group-hover:scale-125"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
