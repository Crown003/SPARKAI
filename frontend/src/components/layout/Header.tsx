"use client";

import React from "react";
import {
  Menu,
  Search,
  Mail,
  Bell,
  Sparkles,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function Header() {
  const {
    activeTab,
    toggleSidebar,
    setIsSearchModalOpen,
  } = useDashboardStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-6 lg:px-8 bg-white/80 backdrop-blur-md border-b border-slate-100">
      {/* Left: Hamburger & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          {activeTab}
        </h2>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl mx-6 hidden md:block">
        <div
          onClick={() => setIsSearchModalOpen(true)}
          className="relative flex items-center w-full px-4 py-2.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/70 rounded-2xl text-xs text-slate-400 cursor-pointer transition-all duration-200 shadow-2xs group"
        >
          <Search className="h-4 w-4 text-slate-400 group-hover:text-slate-600 mr-2.5 shrink-0" />
          <span className="flex-1 text-slate-500">
            Search projects, analyses, reports...
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
            <span className="text-xs">⌘</span> K
          </kbd>
        </div>
      </div>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center gap-3">
        {/* Messages */}
        <button
          onClick={() => {}}
          aria-label="Messages"
          className="relative p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <Mail className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button
          onClick={() => {}}
          aria-label="Notifications"
          className="relative p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
            3
          </span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 ml-1 border-l border-slate-200">
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-200 via-rose-200 to-indigo-200 flex items-center justify-center text-slate-800 font-semibold text-xs border border-slate-200/80 shadow-2xs overflow-hidden">
              <span className="font-bold text-slate-700">AS</span>
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-200" />
          </div>

          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
              <span>Aarav Singh</span>
              <Sparkles className="h-3 w-3 text-emerald-500 fill-emerald-500" />
            </div>
            <p className="text-[10px] font-medium text-slate-400">Student</p>
          </div>
        </div>
      </div>
    </header>
  );
}
