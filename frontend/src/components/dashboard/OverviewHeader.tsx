"use client";

import React, { useState } from "react";
import {
  Code2,
  Users2,
  GitCommit,
  ShieldAlert,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { mockQuickStats } from "@/data/mockData";
import { useDashboardStore } from "@/store/useDashboardStore";

const iconMap: Record<string, React.ElementType> = {
  code: Code2,
  users: Users2,
  "git-commit": GitCommit,
  "shield-alert": ShieldAlert,
};

const colorStyles: Record<string, { bg: string; text: string; iconBg: string }> = {
  emerald: {
    bg: "bg-emerald-50/50 hover:bg-emerald-50 border-emerald-100/60",
    text: "text-emerald-700",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  purple: {
    bg: "bg-purple-50/50 hover:bg-purple-50 border-purple-100/60",
    text: "text-purple-700",
    iconBg: "bg-purple-100 text-purple-600",
  },
  blue: {
    bg: "bg-blue-50/50 hover:bg-blue-50 border-blue-100/60",
    text: "text-blue-700",
    iconBg: "bg-blue-100 text-blue-600",
  },
  rose: {
    bg: "bg-rose-50/50 hover:bg-rose-50 border-rose-100/60",
    text: "text-rose-700",
    iconBg: "bg-rose-100 text-rose-600",
  },
};

export default function OverviewHeader() {
  const { timeRange, setTimeRange } = useDashboardStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const timeRanges = [
    "May 20 - May 26, 2025",
    "May 13 - May 19, 2025",
    "May 06 - May 12, 2025",
    "Last 30 Days",
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
      {/* Welcome Title */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Welcome back, Aarav</span>
          <span className="animate-wiggle inline-block">👋</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Here&apos;s your overview for this week
        </p>
      </div>

      {/* Quick Stat Pills & Date Range */}
      <div className="flex flex-wrap items-center gap-2.5">
        {mockQuickStats.map((stat) => {
          const Icon = iconMap[stat.icon] || Code2;
          const style = colorStyles[stat.color || "emerald"];

          return (
            <div
              key={stat.id}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-2xs transition-all hover:shadow-xs`}
            >
              <div
                className={`h-7 w-7 rounded-xl flex items-center justify-center ${style.iconBg}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-bold text-slate-900">
                  {stat.value}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {stat.label}
                </span>
              </div>
            </div>
          );
        })}

        {/* Date Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-2xl text-xs font-medium text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
            <span>{timeRange}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
              {timeRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setTimeRange(range);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                    timeRange === range
                      ? "text-emerald-700 bg-emerald-50 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
