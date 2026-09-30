"use client";

import React from "react";
import {
  FolderGit2,
  Plus,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RepoItem {
  id: string;
  name: string;
  owner: string;
  branch: string;
  score: number;
  status: "Ready" | "Needs Review" | "In Progress";
  filesCount: number;
  lastScanned: string;
  color: "orange" | "blue" | "emerald" | "purple";
}

const mockRepositories: RepoItem[] = [
  {
    id: "1",
    name: "weather-app",
    owner: "Crown003",
    branch: "main",
    score: 84,
    status: "Ready",
    filesCount: 248,
    lastScanned: "10m ago",
    color: "orange",
  },
  {
    id: "2",
    name: "spark-core",
    owner: "SPARK-Org",
    branch: "main",
    score: 92,
    status: "Ready",
    filesCount: 412,
    lastScanned: "2h ago",
    color: "emerald",
  },
  {
    id: "3",
    name: "commerce-api",
    owner: "Acme-Store",
    branch: "develop",
    score: 79,
    status: "Needs Review",
    filesCount: 180,
    lastScanned: "1d ago",
    color: "blue",
  },
  {
    id: "4",
    name: "mobile-client",
    owner: "Crown003",
    branch: "release/v2",
    score: 88,
    status: "Ready",
    filesCount: 320,
    lastScanned: "3d ago",
    color: "purple",
  },
];

interface RepositoryListCardProps {
  currentProject: string;
  onSelectProject: (repoName: string) => void;
  onAddNew?: () => void;
}

export default function RepositoryListCard({
  currentProject,
  onSelectProject,
  onAddNew,
}: RepositoryListCardProps) {
  const activeRepo = mockRepositories.find((r) => r.name === currentProject) || mockRepositories[0];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Project Vault
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              Analyzed Repositories
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
            {mockRepositories.length} Projects
          </span>
        </div>

        {/* Featured Card (Clean White / Warm Ivory Style with high contrast) */}
        <div className="relative rounded-2xl p-5 bg-orange-50/60 border border-orange-200 shadow-2xs mb-4">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Active Project
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-white border border-orange-200 text-xs font-bold text-orange-700 shadow-2xs">
              {activeRepo.branch}
            </span>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="text-xs text-gray-500 font-semibold">{activeRepo.owner}</span>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate max-w-[200px]">
                {activeRepo.name}
              </h4>
            </div>

            <div className="text-right">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Readiness</span>
              <span className="text-3xl font-black text-emerald-700 leading-none">
                {activeRepo.score}
                <small className="text-sm text-gray-500 font-semibold ml-0.5">/100</small>
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-orange-200/80 flex items-center justify-between text-xs text-gray-700 font-semibold">
            <span>{activeRepo.filesCount} files analyzed</span>
            <span>Scanned {activeRepo.lastScanned}</span>
          </div>
        </div>

        {/* List of Uploaded & Analyzed Repositories */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
            Switch Repository
          </span>

          {mockRepositories.map((repo) => {
            const isSelected = repo.name === currentProject;

            return (
              <div
                key={repo.id}
                onClick={() => onSelectProject(repo.name)}
                className={cn(
                  "group flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer",
                  isSelected
                    ? "bg-orange-50/80 border-orange-300 shadow-2xs"
                    : "bg-gray-50/70 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                )}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                      isSelected
                        ? "bg-orange-600 text-white shadow-xs"
                        : "bg-gray-200 text-gray-800"
                    )}
                  >
                    <FolderGit2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-sm font-bold text-gray-900 truncate">
                      {repo.name}
                    </h5>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mt-0.5">
                      <span>{repo.owner}</span>
                      <span>·</span>
                      <span className="text-gray-500">{repo.filesCount} files</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={cn(
                        "text-sm font-black block",
                        repo.score >= 85
                          ? "text-emerald-700"
                          : repo.score >= 75
                          ? "text-orange-700"
                          : "text-rose-700"
                      )}
                    >
                      {repo.score} pts
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 block">{repo.status}</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-5 w-5 transition-transform group-hover:translate-x-0.5",
                      isSelected ? "text-orange-600" : "text-gray-400"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Add/Sync Project Action */}
      <div className="mt-5 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onAddNew}
          className="w-full h-11 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 text-sm font-bold text-gray-900 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <Plus className="h-4.5 w-4.5 text-orange-600" />
          <span>Connect Another Project</span>
        </button>
      </div>
    </div>
  );
}
