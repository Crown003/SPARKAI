"use client";

import React from "react";
import {
  FolderKanban,
  ShieldAlert,
  FileText,
  PieChart,
  Code2,
  ShieldCheck,
  CircleDot,
  Gauge,
} from "lucide-react";
import { MetricCardData } from "@/types/dashboard";
import MetricCard from "./MetricCard";

const iconMap: Record<string, React.ElementType> = {
  folder: FolderKanban,
  "shield-alert": ShieldAlert,
  "file-text": FileText,
  "pie-chart": PieChart,
  code: Code2,
  security: ShieldCheck,
  testing: CircleDot,
  performance: Gauge,
};

const colorMapping: Record<string, "orange" | "blue" | "violet" | "green"> = {
  emerald: "green",
  rose: "orange",
  green: "green",
  purple: "violet",
  orange: "orange",
  blue: "blue",
  violet: "violet",
};

interface StatCardProps {
  card: MetricCardData;
  index?: number;
  onClick?: () => void;
}

export default function StatCard({ card, index = 0, onClick }: StatCardProps) {
  const Icon = iconMap[card.icon] || FolderKanban;
  const color = colorMapping[card.color] || "orange";

  return (
    <MetricCard
      label={card.title}
      score={card.count}
      delta={card.change}
      icon={Icon}
      color={color}
      index={index}
      onClick={onClick}
    />
  );
}
