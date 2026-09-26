import type { Metadata } from "next";
import AnalysisWorkspace from "./AnalysisWorkspace";

export const metadata: Metadata = {
  title: "Dashboard | SPARK AI",
  description: "Review repository health, quality, security, and engineering readiness in SPARK AI.",
};

export default function AnalysisPage() {
  return <AnalysisWorkspace />;
}
