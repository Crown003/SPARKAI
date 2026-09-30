"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  label: string;
  score: number;
  delta: string;
  icon: React.ElementType;
  color: "orange" | "blue" | "violet" | "green" | "emerald";
  index?: number;
  animationKey?: number | string;
  onClick?: () => void;
  className?: string;
}

const themeConfigs = {
  blue: {
    iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
    stroke: "#2563eb",
    track: "stroke-gray-100",
    trendBg: "text-emerald-700 bg-emerald-50 border border-emerald-100",
    subtitle: "Vulnerability & Deps",
  },
  green: {
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    stroke: "#10b981",
    track: "stroke-gray-100",
    trendBg: "text-emerald-700 bg-emerald-50 border border-emerald-100",
    subtitle: "Speed & Execution",
  },
  emerald: {
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    stroke: "#10b981",
    track: "stroke-gray-100",
    trendBg: "text-emerald-700 bg-emerald-50 border border-emerald-100",
    subtitle: "Speed & Execution",
  },
  orange: {
    iconBg: "bg-orange-50 text-orange-600 border border-orange-100",
    stroke: "#ea580c",
    track: "stroke-gray-100",
    trendBg: "text-emerald-700 bg-emerald-50 border border-emerald-100",
    subtitle: "Architecture & AST",
  },
  violet: {
    iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
    stroke: "#8b5cf6",
    track: "stroke-gray-100",
    trendBg: "text-emerald-700 bg-emerald-50 border border-emerald-100",
    subtitle: "Coverage & Suites",
  },
};

function AnimatedScoreNumber({
  target,
  animationKey,
}: {
  target: number;
  animationKey?: string | number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1000;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(easeOut * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, animationKey]);

  return <span>{displayValue}</span>;
}

export function CircularProgress({
  score,
  color = "orange",
  index = 0,
  animationKey,
  size = 80,
}: {
  score: number;
  color?: "orange" | "blue" | "violet" | "green" | "emerald";
  index?: number;
  animationKey?: string | number;
  size?: number;
}) {
  const theme = themeConfigs[color] || themeConfigs.orange;
  const radius = 30;
  const strokeWidth = 5.8;
  const circumference = 2 * Math.PI * radius; // ~188.5

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${score} out of 100`}
    >
      <svg
        viewBox="0 0 72 72"
        className="w-full h-full -rotate-90 overflow-visible"
        aria-hidden="true"
      >
        {/* Background Track Circle */}
        <circle
          cx="36"
          cy="36"
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-gray-100"
        />
        {/* Animated Active Progress Circle */}
        <motion.circle
          key={`circle-${animationKey ?? "key"}-${score}`}
          cx="36"
          cy="36"
          r={radius}
          stroke={theme.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - Math.min(score, 100) / 100) }}
          transition={{
            duration: 1.15,
            ease: [0.16, 1, 0.3, 1],
            delay: index * 0.08,
          }}
        />
      </svg>
      {/* Centered Number Value */}
      <div className="absolute inset-0 flex items-center justify-center text-lg sm:text-xl font-black tracking-tight text-gray-900">
        <AnimatedScoreNumber target={score} animationKey={animationKey} />
      </div>
    </div>
  );
}

export default function MetricCard({
  label,
  score,
  delta,
  icon: Icon,
  color,
  index = 0,
  animationKey,
  onClick,
  className,
}: MetricCardProps) {
  const theme = themeConfigs[color] || themeConfigs.orange;
  const headingTitle = label.toLowerCase().includes("analyzer") ? label : `${label} Analyzer`;

  return (
    <article
      onClick={onClick}
      className={cn(
        "bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between cursor-pointer select-none",
        className
      )}
    >
      {/* Top row: Icon adjacent to Heading Title + Trend delta pill */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs",
              theme.iconBg
            )}
          >
            <Icon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <h4 className="text-base sm:text-lg font-black text-gray-900 truncate">
              {headingTitle}
            </h4>
            <span className="text-xs font-semibold text-gray-500 block truncate">
              {theme.subtitle}
            </span>
          </div>
        </div>

        <div
          className={cn(
            "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold tracking-tight shadow-2xs shrink-0",
            theme.trendBg
          )}
        >
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" />
          <span>{delta}</span>
        </div>
      </div>

      {/* Bottom row: Big Score + Extra Large Circular Progress Ring */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="space-y-1">
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
            Readiness Index
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 leading-none">
              {score}
            </span>
            <span className="text-sm font-bold text-gray-400">
              / 100
            </span>
          </div>
          <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 mt-1">
            Passing Benchmarks
          </span>
        </div>

        <CircularProgress
          score={score}
          color={color}
          index={index}
          animationKey={animationKey}
          size={80}
        />
      </div>
    </article>
  );
}
