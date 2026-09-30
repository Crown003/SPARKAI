"use client";

import React, { useState } from "react";
import {
  GitFork as Github,
  GitBranch,
  UploadCloud,
  Download,
  Activity,
  CheckCircle2,
  Sparkles,
  Link2,
  FileCode2,
  Clock,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RepoWorkspaceCardProps {
  currentProject: string;
  onSelectProject: (repo: string) => void;
  onAnalyze: () => void;
  onDownloadReport: () => void;
  isAnalyzing?: boolean;
}

export default function RepoWorkspaceCard({
  currentProject,
  onSelectProject,
  onAnalyze,
  onDownloadReport,
  isAnalyzing = false,
}: RepoWorkspaceCardProps) {
  const [activeTab, setActiveTab] = useState<"github" | "local">("github");
  const [githubUrl, setGithubUrl] = useState("");
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [branch, setBranch] = useState("main");

  const handleGithubImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;
    const cleanName = githubUrl.split("/").filter(Boolean).pop()?.replace(".git", "") || "custom-repo";
    onSelectProject(cleanName);
    setGithubUrl("");
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setLocalFileName(file.name);
      const repoName = file.name.replace(/\.[^/.]+$/, "");
      onSelectProject(repoName);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLocalFileName(file.name);
      const repoName = file.name.replace(/\.[^/.]+$/, "");
      onSelectProject(repoName);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between h-full">
      {/* Top Banner: Selected Repository Info */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-gray-200">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Github className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Active Repository
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Synced
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 truncate flex items-center gap-2 mt-0.5">
                <span>{currentProject}</span>
                <span className="text-sm font-semibold text-gray-400">
                  / main
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>Scanned: 10m ago</span>
          </div>
        </div>

        {/* Repository Specs & Tags */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
            <span className="text-xs text-gray-500 block font-semibold">Branch</span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 mt-1">
              <GitBranch className="h-4 w-4 text-orange-600" />
              <span>{branch}</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
            <span className="text-xs text-gray-500 block font-semibold">Files Scanned</span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 mt-1">
              <FileCode2 className="h-4 w-4 text-blue-600" />
              <span>248 files</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
            <span className="text-xs text-gray-500 block font-semibold">Tech Stack</span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 mt-1">
              <Layers className="h-4 w-4 text-purple-600" />
              <span>Next.js / TS</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
            <span className="text-xs text-gray-500 block font-semibold">Readiness Score</span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 mt-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>84 / 100</span>
            </div>
          </div>
        </div>

        {/* Upload / Import Mode Tabs */}
        <div className="mt-2">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Upload or Connect More Projects
            </span>
            <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab("github")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  activeTab === "github"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                GitHub URL
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("local")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  activeTab === "local"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Local ZIP / Folder
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "github" ? (
              <motion.form
                key="github-form"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                onSubmit={handleGithubImport}
                className="flex flex-col sm:flex-row gap-2.5"
              >
                <div className="relative flex-1">
                  <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
                  <input
                    type="url"
                    placeholder="https://github.com/owner/repository"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full h-11 sm:h-12 pl-10 pr-3.5 text-sm font-semibold bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-2xs transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 sm:h-12 px-6 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 active:scale-[0.98] text-white font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-500/30 shrink-0 border border-orange-400/40"
                >
                  <Github className="h-5 w-5 stroke-[2.5]" />
                  <span className="tracking-wide">Connect Repo</span>
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="local-upload"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer",
                  isDragOver
                    ? "border-orange-500 bg-orange-50/50"
                    : "border-gray-300 bg-gray-50/70 hover:bg-gray-50 hover:border-gray-400"
                )}
              >
                <input
                  type="file"
                  onChange={handleFileInput}
                  accept=".zip,.tar,.gz"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    {localFileName ? (
                      <span className="text-emerald-700 font-bold">{localFileName} uploaded successfully!</span>
                    ) : (
                      <span>Drop local project ZIP or <span className="text-orange-600 underline">browse files</span></span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    Supports .zip archives or project folders up to 100MB
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Footer: Analyze Codebase & Download Overall Report */}
      <div className="mt-6 pt-5 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white text-sm font-bold shadow-sm shadow-orange-600/25 transition-all cursor-pointer disabled:opacity-75"
          >
            <Activity className={cn("h-4.5 w-4.5", isAnalyzing && "animate-spin")} />
            <span>{isAnalyzing ? "Analyzing Repository..." : "Run AI Analysis"}</span>
          </button>

          <button
            type="button"
            onClick={onDownloadReport}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 text-sm font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Download className="h-4.5 w-4.5 text-gray-600" />
            <span>Download Report</span>
          </button>
        </div>

        <div className="text-xs text-gray-600 font-bold flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-orange-600" />
          <span>Analysis Ready</span>
        </div>
      </div>
    </div>
  );
}
