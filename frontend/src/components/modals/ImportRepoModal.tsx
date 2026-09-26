"use client";

import React, { useState } from "react";
import { X, GitBranch, CloudUpload, Sparkles, Loader2 } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function ImportRepoModal() {
  const { isImportModalOpen, setIsImportModalOpen, addNewRepository } = useDashboardStore();
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [org, setOrg] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isImportModalOpen) return null;

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      // Extract repo name
      const name = repoUrl.replace("https://github.com/", "").trim() || repoUrl;
      addNewRepository(name, org || "GitHub");
      setIsAnalyzing(false);
      setRepoUrl("");
      setOrg("");
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 md:p-8 relative">
        <button
          onClick={() => setIsImportModalOpen(false)}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CloudUpload className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Import Repository
            </h2>
            <p className="text-xs text-slate-500">
              Connect a Git repository for AST parsing &amp; AI analysis
            </p>
          </div>
        </div>

        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Repository URL or Path
            </label>
            <div className="relative">
              <GitBranch className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. crown003/spark-ai or https://github.com/org/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Branch
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Organization (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. SPARK AI"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-[11px] text-emerald-800 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              SPARK AI Celery workers will clone, extract AST node trees, compute cyclomatic complexity, and generate the Engineering Knowledge Graph.
            </span>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Analyzing Repo...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="h-3.5 w-3.5" />
                  <span>Start Analysis</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
