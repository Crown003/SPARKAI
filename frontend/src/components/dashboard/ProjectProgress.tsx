"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { mockProgressData } from "@/data/mockData";

export default function ProjectProgress() {
  const [timeframe, setTimeframe] = useState("This Week");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // SVG Gauge Math for 180-degree semi-circle or 240-degree open gauge
  const percentage = mockProgressData.completed; // 41%
  const radius = 64;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Let's create an arc from 135 deg to 405 deg (270 deg total) or 180 deg
  const arcLength = circumference * 0.75; // 270 degrees arc
  const strokeDashoffset = arcLength - (percentage / 100) * arcLength;

  return (
    <div className="relative bg-white border border-slate-100/90 rounded-3xl p-5 shadow-2xs flex flex-col justify-between overflow-hidden h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Project Progress
          </h3>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-600 transition-colors cursor-pointer"
            >
              <span>{timeframe}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20">
                {["This Week", "This Month", "All Time"].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setTimeframe(option);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Progress Display: Gauge & Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center my-2">
          {/* Gauge Center Graphic */}
          <div className="relative flex flex-col items-center justify-center">
            <div className="relative w-40 h-36 flex items-center justify-center">
              <svg
                viewBox="0 0 160 140"
                className="w-full h-full transform -rotate-135"
              >
                {/* Background Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={normalizedRadius}
                  stroke="#f1f5f9"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${arcLength} ${circumference}`}
                  strokeLinecap="round"
                />
                {/* Active Progress Arc */}
                <circle
                  cx="80"
                  cy="80"
                  r={normalizedRadius}
                  stroke="#10b981"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${arcLength} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-2">
                <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {percentage}%
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  Completed
                </span>
              </div>
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-3 pl-2">
            {/* Completed */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-100" />
                <span className="text-xs font-medium text-slate-700">
                  Completed
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900">
                {mockProgressData.completed}%
              </span>
            </div>

            {/* In Progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-100" />
                <span className="text-xs font-medium text-slate-700">
                  In Progress
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900">
                {mockProgressData.inProgress}%
              </span>
            </div>

            {/* Pending */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-amber-100" />
                <span className="text-xs font-medium text-slate-700">
                  Pending
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900">
                {mockProgressData.pending}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Wave Art along the bottom */}
      <div className="w-full h-16 opacity-75 pointer-events-none -mb-2">
        <svg
          viewBox="0 0 400 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60 C80 80, 140 10, 220 40 C300 70, 360 20, 400 35 L400 80 L0 80 Z"
            fill="url(#waveGradient)"
            opacity="0.25"
          />
          <path
            d="M0 60 C80 80, 140 10, 220 40 C300 70, 360 20, 400 35"
            stroke="#10b981"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            opacity="0.7"
          />
          <path
            d="M0 68 C70 82, 160 25, 240 50 C320 75, 370 30, 400 45"
            stroke="#34d399"
            strokeWidth="1"
            opacity="0.5"
          />
          <path
            d="M0 72 C90 85, 180 35, 260 58 C340 80, 380 40, 400 52"
            stroke="#6ee7b7"
            strokeWidth="0.8"
            opacity="0.4"
          />
          <defs>
            <linearGradient
              id="waveGradient"
              x1="0"
              y1="0"
              x2="400"
              y2="80"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="1" stopColor="#a7f3d0" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
