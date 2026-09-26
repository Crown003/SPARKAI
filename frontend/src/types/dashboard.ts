export interface QuickStat {
  id: string;
  label: string;
  value: string;
  icon: string;
  color?: string;
}

export interface MetricCardData {
  id: string;
  title: string;
  count: number;
  change: string;
  isPositive: boolean;
  sparkline: number[];
  color: "emerald" | "rose" | "green" | "purple";
  icon: string;
}

export interface AnalysisItem {
  id: string;
  repoName: string;
  organization: string;
  date: string;
  score: number;
  iconType: "code" | "cart" | "cpu" | "mobile" | "database";
  status: "Completed" | "In Progress" | "Needs Review";
  metrics?: {
    cyclomaticComplexity: number;
    testCoverage: number;
    maintainabilityIndex: number;
    securityVulnerabilities: number;
    astNodes: number;
  };
  recommendations?: string[];
}

export interface ProgressBreakdown {
  completed: number;
  inProgress: number;
  pending: number;
}
