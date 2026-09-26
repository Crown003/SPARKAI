"use client";

import React from "react";
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  CloudUpload,
  BarChart3,
  FileText,
  GitCompare,
  Users2,
  Settings,
  Network,
  Zap,
  ArrowRight,
  TrendingUp,
  X,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  action?: () => void;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setSidebarOpen,
    setIsImportModalOpen,
  } = useDashboardStore();

  const navSections: NavSection[] = [
    {
      items: [
        {
          id: "Dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "PROJECTS",
      items: [
        {
          id: "My Projects",
          label: "My Projects",
          icon: FolderKanban,
        },
        {
          id: "Repositories",
          label: "Repositories",
          icon: BookOpen,
        },
        {
          id: "Import Repository",
          label: "Import Repository",
          icon: CloudUpload,
          action: () => setIsImportModalOpen(true),
        },
      ],
    },
    {
      title: "ANALYSIS",
      items: [
        {
          id: "All Analyses",
          label: "All Analyses",
          icon: BarChart3,
        },
        {
          id: "Reports",
          label: "Reports",
          icon: FileText,
        },
        {
          id: "Compare",
          label: "Compare",
          icon: GitCompare,
        },
      ],
    },
    {
      title: "ADMIN",
      items: [
        {
          id: "Users",
          label: "Users",
          icon: Users2,
        },
        {
          id: "Settings",
          label: "Settings",
          icon: Settings,
        },
        {
          id: "Integrations",
          label: "Integrations",
          icon: Network,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col justify-between py-6 px-4 transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto shadow-xs",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* Brand Logo & Title */}
          <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                <Zap className="h-5 w-5 fill-emerald-500 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1">
                  SPARK <span className="text-emerald-600 font-extrabold">AI</span>
                </h1>
                <p className="text-[10px] font-medium text-slate-400">
                  Engineering Readiness Analyzer
                </p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-6">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                {section.title && (
                  <h3 className="px-3 text-[11px] font-semibold text-slate-400 tracking-wider mb-2">
                    {section.title}
                  </h3>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.action) {
                          item.action();
                        } else {
                          setActiveTab(item.id);
                        }
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group text-left",
                        isActive
                          ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100/80 shadow-xs"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isActive
                            ? "text-emerald-600"
                            : "text-slate-400 group-hover:text-slate-600"
                        )}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Level Up Promo Card */}
        <div className="mt-8 pt-4">
          <div className="relative rounded-2xl bg-gradient-to-b from-emerald-50/60 to-emerald-100/30 border border-emerald-100/80 p-4 overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-xs font-bold text-slate-900 leading-snug mb-1">
                Level up your <br />
                <span className="text-emerald-700">engineering readiness</span>
              </h4>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                Track, analyze &amp; improve your projects.
              </p>

              {/* Graphic mini chart */}
              <div className="h-12 w-full flex items-end justify-between gap-1 mb-3 px-2 py-1 bg-white/70 backdrop-blur-xs rounded-lg border border-emerald-100/50">
                <div className="w-2.5 bg-emerald-200 rounded-t-sm h-3" />
                <div className="w-2.5 bg-emerald-300 rounded-t-sm h-5" />
                <div className="w-2.5 bg-emerald-400 rounded-t-sm h-8" />
                <div className="w-2.5 bg-emerald-500 rounded-t-sm h-6" />
                <div className="w-2.5 bg-emerald-600 rounded-t-sm h-10 flex items-center justify-center">
                  <TrendingUp className="h-2 w-2 text-white -mt-3" />
                </div>
              </div>

              <button
                onClick={() => setActiveTab("All Analyses")}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200/80 shadow-xs transition-colors group cursor-pointer"
              >
                <span>Explore Insights</span>
                <ArrowRight className="h-3 w-3 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
