"use client";

import React from "react";
import {
  Code2,
  ShoppingCart,
  Cpu,
  Smartphone,
  Database,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { AnalysisItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  code: Code2,
  cart: ShoppingCart,
  cpu: Cpu,
  mobile: Smartphone,
  database: Database,
};

const iconColors: Record<string, string> = {
  code: "bg-emerald-50 text-emerald-600 border-emerald-100",
  cart: "bg-purple-50 text-purple-600 border-purple-100",
  cpu: "bg-amber-50 text-amber-600 border-amber-100",
  mobile: "bg-sky-50 text-sky-600 border-sky-100",
  database: "bg-orange-50 text-orange-600 border-orange-100",
};

export default function RecentAnalyses() {
  const { analyses, setSelectedAnalysis, setActiveTab } = useDashboardStore();

  const getScoreStyle = (score: number) => {
    if (score >= 80) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    }
    if (score >= 70) {
      return "bg-teal-50 text-teal-700 border-teal-200/80";
    }
    return "bg-emerald-50/70 text-emerald-800 border-emerald-200/50";
  };

  return (
    <div className="bg-white border border-slate-100/90 rounded-3xl p-5 shadow-2xs flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Recent Analyses
          </h3>
          <button
            onClick={() => setActiveTab("All Analyses")}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Analyses List */}
        <div className="space-y-1 divide-y divide-slate-50">
          {analyses.slice(0, 5).map((item: AnalysisItem) => {
            const Icon = iconMap[item.iconType] || Code2;
            const colorClass = iconColors[item.iconType] || iconColors.code;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedAnalysis(item)}
                className="group flex items-center justify-between py-3 px-2 rounded-2xl hover:bg-slate-50/80 transition-all duration-200 cursor-pointer"
              >
                {/* Left: Icon & Project Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                      colorClass
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                      {item.repoName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {item.organization}
                    </p>
                  </div>
                </div>

                {/* Right: Date, Score Badge & Chevron */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-medium text-slate-400 hidden sm:inline-block">
                    {item.date}
                  </span>

                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-bold border",
                      getScoreStyle(item.score)
                    )}
                  >
                    {item.score}
                  </span>

                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Full Action Button */}
      <div className="mt-4 pt-2">
        <button
          onClick={() => setActiveTab("All Analyses")}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-2xl border border-emerald-100/80 transition-all cursor-pointer group"
        >
          <span>View All Analyses</span>
          <ArrowRight className="h-3.5 w-3.5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
