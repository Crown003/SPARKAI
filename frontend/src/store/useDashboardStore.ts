import { create } from "zustand";
import { AnalysisItem } from "@/types/dashboard";
import { mockAnalyses } from "@/data/mockData";

interface DashboardState {
  activeTab: string;
  isSidebarOpen: boolean;
  selectedAnalysis: AnalysisItem | null;
  isImportModalOpen: boolean;
  isSearchModalOpen: boolean;
  searchQuery: string;
  timeRange: string;
  analyses: AnalysisItem[];

  // Actions
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSelectedAnalysis: (analysis: AnalysisItem | null) => void;
  setIsImportModalOpen: (isOpen: boolean) => void;
  setIsSearchModalOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  setTimeRange: (range: string) => void;
  addNewRepository: (repoName: string, org: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeTab: "Dashboard",
  isSidebarOpen: true,
  selectedAnalysis: null,
  isImportModalOpen: false,
  isSearchModalOpen: false,
  searchQuery: "",
  timeRange: "May 20 - May 26, 2025",
  analyses: mockAnalyses,

  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setSelectedAnalysis: (analysis) => set({ selectedAnalysis: analysis }),
  setIsImportModalOpen: (isOpen) => set({ isImportModalOpen: isOpen }),
  setIsSearchModalOpen: (isOpen) => set({ isSearchModalOpen: isOpen }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setTimeRange: (range) => set({ timeRange: range }),
  addNewRepository: (repoName, org) =>
    set((state) => {
      const newAnalysis: AnalysisItem = {
        id: `ana-${Date.now()}`,
        repoName,
        organization: org || "Personal",
        date: "Just now",
        score: Math.floor(Math.random() * 20) + 80,
        iconType: "code",
        status: "Completed",
        metrics: {
          cyclomaticComplexity: 4.0,
          testCoverage: 85,
          maintainabilityIndex: 90,
          securityVulnerabilities: 0,
          astNodes: 1200,
        },
        recommendations: [
          "Static analysis passed. AST generated with zero critical issues.",
          "Good code structure and modular function breakdowns.",
        ],
      };
      return { analyses: [newAnalysis, ...state.analyses], isImportModalOpen: false };
    }),
}));
