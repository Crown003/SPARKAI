"use client";

import React from "react";
import {
  X,
  ShieldCheck,
  Zap,
  Layers,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function AnalysisDetailModal() {
  const { selectedAnalysis, setSelectedAnalysis } = useDashboardStore();

  if (!selectedAnalysis) return null;

  const metrics = selectedAnalysis.metrics || {
    cyclomaticComplexity: 4.5,
    testCoverage: 80,
    maintainabilityIndex: 85,
    securityVulnerabilities: 0,
    astNodes: 1500,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 md:p-8 relative">
        {/* Close Button */}
        <button
          onClick={() => setSelectedAnalysis(null)}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <Zap className="h-6 w-6 fill-emerald-500 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {selectedAnalysis.repoName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {selectedAnalysis.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Organization: <span className="font-semibold text-slate-700">{selectedAnalysis.organization}</span> &bull; Analyzed on {selectedAnalysis.date}
            </p>
          </div>
        </div>

        {/* Big Readiness Score Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 text-white p-6 mb-6 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Engineering Readiness Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold">{selectedAnalysis.score}</span>
              <span className="text-emerald-200 text-sm font-medium">/ 100</span>
            </div>
            <p className="text-xs text-emerald-50 mt-1">
              {selectedAnalysis.score >= 80
                ? "🚀 Industry-Ready: Exceeds standard production quality benchmarks."
                : "⚠️ Needs Improvement: Address code complexity and test coverage."}
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Metric Cards Grid */}
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          AST &amp; Code Quality Metrics
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Layers className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-[11px] font-medium">Maintainability</span>
            </div>
            <span className="text-base font-bold text-slate-900">
              {metrics.maintainabilityIndex}/100
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <FileCode2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[11px] font-medium">Test Coverage</span>
            </div>
            <span className="text-base font-bold text-slate-900">
              {metrics.testCoverage}%
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Cpu className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[11px] font-medium">Complexity</span>
            </div>
            <span className="text-base font-bold text-slate-900">
              {metrics.cyclomaticComplexity} avg
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              <span className="text-[11px] font-medium">Vulnerabilities</span>
            </div>
            <span className="text-base font-bold text-slate-900">
              {metrics.securityVulnerabilities}
            </span>
          </div>
        </div>

        {/* AI Recommendations */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            AI-Powered Recommendations
          </h4>
          <div className="space-y-2">
            {(selectedAnalysis.recommendations || [
              "Review cyclomatic complexity in core modules.",
              "Expand unit tests to reach target 85% coverage.",
            ]).map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100/60 text-xs text-slate-700"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action button */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={() => setSelectedAnalysis(null)}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => setSelectedAnalysis(null)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Export Full PDF Report
          </button>
        </div>
      </div>
    </div>
  );
}
