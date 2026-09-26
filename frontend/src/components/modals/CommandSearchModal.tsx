"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  Code2,
  FileText,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function CommandSearchModal() {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    analyses,
    setSelectedAnalysis,
    setActiveTab,
  } = useDashboardStore();

  const [query, setQuery] = useState("");

  // Listen to ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const filteredAnalyses = analyses.filter(
    (a) =>
      a.repoName.toLowerCase().includes(query.toLowerCase()) ||
      a.organization.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search projects, analyses, reports or type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setIsSearchModalOpen(false)}
            aria-label="Close search"
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Repositories &amp; Analyses
          </div>

          {filteredAnalyses.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No matching results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredAnalyses.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedAnalysis(item);
                  setIsSearchModalOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/60 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Code2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700">
                      {item.repoName}
                    </p>
                    <p className="text-[10px] text-slate-400">{item.organization}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                    Score: {item.score}
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-emerald-600" />
                </div>
              </button>
            ))
          )}

          <div className="pt-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100 mt-2">
            Quick Navigation
          </div>
          <button
            onClick={() => {
              setActiveTab("Reports");
              setIsSearchModalOpen(false);
            }}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
          >
            <FileText className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-700">Go to Reports</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("All Analyses");
              setIsSearchModalOpen(false);
            }}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
          >
            <BarChart3 className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-700">Go to All Analyses</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span>Navigate with <b>↑</b> <b>↓</b></span>
          <span>Press <b>ESC</b> to close</span>
        </div>
      </div>
    </div>
  );
}
