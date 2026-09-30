"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DataPoint {
  date: string;
  baseline: number;
  projected: number;
  milestone?: string;
}

const trajectoryData: DataPoint[] = [
  { date: "MAR 01", baseline: 62, projected: 62 },
  { date: "MAR 08", baseline: 68, projected: 74, milestone: "Checkout integration tests added (+6 pts)" },
  { date: "MAR 15", baseline: 74, projected: 82, milestone: "Dependency vulnerability patched (+8 pts)" },
  { date: "MAR 22", baseline: 78, projected: 88, milestone: "Refactored API client architecture (+6 pts)" },
  { date: "MAR 29", baseline: 82, projected: 92, milestone: "Flaky tests isolated & resolved (+4 pts)" },
  { date: "TODAY", baseline: 84, projected: 96, milestone: "Ready for production handoff (+12 pts)" },
];

export default function PerformanceImpactChart() {
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [activePoint, setActivePoint] = useState<DataPoint>(trajectoryData[trajectoryData.length - 1]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // SVG Chart Geometry
  const width = 640;
  const height = 230;
  const paddingX = 45;
  const paddingY = 32;

  const minScore = 50;
  const maxScore = 100;
  const scoreRange = maxScore - minScore;

  const getX = (index: number) =>
    paddingX + (index / (trajectoryData.length - 1)) * (width - 2 * paddingX);
  const getY = (score: number) =>
    height - paddingY - ((score - minScore) / scoreRange) * (height - 2 * paddingY);

  const baselinePoints = trajectoryData.map((d, i) => ({ x: getX(i), y: getY(d.baseline) }));
  const projectedPoints = trajectoryData.map((d, i) => ({ x: getX(i), y: getY(d.projected) }));

  const baselinePath = baselinePoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
    ""
  );
  const projectedPath = projectedPoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
    ""
  );

  const projectedAreaPath = `${projectedPath} L ${projectedPoints[projectedPoints.length - 1].x},${height - paddingY} L ${projectedPoints[0].x},${height - paddingY} Z`;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Trajectory Analysis
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                <Sparkles className="h-3.5 w-3.5" />
                AI Projected Gains
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
              Readiness & Performance Evolution
            </h3>
            <p className="text-sm font-medium text-gray-600 mt-0.5">
              Simulated score gains over time as suggested security, quality, and testing fixes are applied.
            </p>
          </div>

          {/* Timeframe Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-xs font-bold text-gray-800 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <span>{timeRange}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-30 animate-in fade-in zoom-in-95">
                {["Last 7 Days", "Last 30 Days", "Projected 90 Days"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setTimeRange(option);
                      setIsDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-xs font-bold transition-colors cursor-pointer",
                      timeRange === option
                        ? "text-orange-600 bg-orange-50 font-extrabold"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Score Metrics Callout Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div>
            <span className="text-xs font-bold text-gray-500 block">Current Baseline Score</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-gray-900">84</span>
              <span className="text-xs font-bold text-gray-400">/ 100</span>
            </div>
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-700 block flex items-center gap-1">
              <span>With AI Fixes Applied</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-emerald-700">96</span>
              <span className="text-xs font-extrabold text-emerald-600">+14.2% boost</span>
            </div>
          </div>
          <div className="sm:border-l sm:border-gray-200 sm:pl-4">
            <span className="text-xs font-bold text-gray-500 block">Active Milestone</span>
            <span className="text-xs font-bold text-gray-900 truncate block mt-1" title={activePoint.milestone || "Steady progress"}>
              {activePoint.milestone || "Steady codebase progress"}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Trajectory Chart */}
      <div className="w-full relative mt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-52 sm:h-60 overflow-visible select-none"
        >
          <defs>
            <linearGradient id="projectedGlowClean" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[60, 75, 90, 100].map((score) => {
            const y = getY(score);
            return (
              <g key={score}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                />
                <text
                  x={paddingX - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] fill-gray-500 font-bold"
                >
                  {score}
                </text>
              </g>
            );
          })}

          {/* Area Fill for Projected Improvement */}
          <path d={projectedAreaPath} fill="url(#projectedGlowClean)" />

          {/* Baseline Curve (Dashed Slate) */}
          <path
            d={baselinePath}
            fill="none"
            stroke="#9ca3af"
            strokeWidth="3"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />

          {/* Projected / Post-Fix Curve (Solid Vibrant Orange/Coral) */}
          <path
            d={projectedPath}
            fill="none"
            stroke="#ea580c"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Milestone Interactive Points */}
          {trajectoryData.map((pt, i) => {
            const bx = getX(i);
            const by = getY(pt.baseline);
            const px = getX(i);
            const py = getY(pt.projected);
            const isSelected = activePoint.date === pt.date;

            return (
              <g
                key={pt.date}
                className="cursor-pointer group"
                onClick={() => setActivePoint(pt)}
              >
                {/* Baseline Dot */}
                <circle
                  cx={bx}
                  cy={by}
                  r="4"
                  className="fill-white stroke-gray-500 stroke-[2.5] transition-transform group-hover:scale-125"
                />

                {/* Projected Improvement Dot */}
                <circle
                  cx={px}
                  cy={py}
                  r={isSelected ? "7" : "5"}
                  className="fill-white stroke-orange-600 stroke-[3.5] transition-all group-hover:scale-130"
                />

                {/* Date Label */}
                <text
                  x={bx}
                  y={height - 8}
                  textAnchor="middle"
                  className={cn(
                    "text-[11px] font-bold transition-colors",
                    isSelected
                      ? "fill-orange-600 font-black"
                      : "fill-gray-600"
                  )}
                >
                  {pt.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Chart Legend Footer */}
      <div className="pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-6 bg-orange-600 rounded-full" />
            <span className="font-bold text-gray-900">With AI Fixes Applied</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 bg-gray-500 border-b-2 border-dashed border-gray-500" />
            <span className="font-bold text-gray-600">Baseline Actual</span>
          </div>
        </div>

        <div className="text-xs font-semibold text-gray-500">
          Click data points to see milestone details
        </div>
      </div>
    </div>
  );
}
