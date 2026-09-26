import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CircleDot,
  Clock3,
  Code2,
  FileCode2,
  GitBranch,
  GitPullRequest,
  Gauge,
  Layers3,
  LockKeyhole,
  Network,
  ShieldCheck,
  Zap,
} from "lucide-react";
import styles from "./section-view.module.css";

interface SectionViewProps {
  section: string;
  onAction: (message: string) => void;
}

interface Metric {
  label: string;
  value: string;
  change: string;
  icon: typeof Activity;
  tone: "orange" | "blue" | "green" | "violet";
}

interface Row {
  title: string;
  detail: string;
  value: string;
  status: string;
  tone: "orange" | "blue" | "green" | "neutral";
}

interface SectionData {
  eyebrow: string;
  description: string;
  metrics: Metric[];
  chartTitle: string;
  chartCaption: string;
  bars: { label: string; value: number }[];
  listTitle: string;
  rows: Row[];
}

const qualityView: SectionData = {
  eyebrow: "MAINTAINABILITY",
  description: "Find complexity, duplication, and code health trends before they slow your team down.",
  metrics: [
    { label: "Maintainability", value: "91", change: "+6 pts", icon: Code2, tone: "orange" },
    { label: "Code smells", value: "18", change: "4 resolved", icon: AlertTriangle, tone: "blue" },
    { label: "Duplication", value: "2.8%", change: "-1.2%", icon: Layers3, tone: "violet" },
    { label: "Complexity", value: "Low", change: "Stable", icon: Activity, tone: "green" },
  ],
  chartTitle: "Quality trend",
  chartCaption: "Maintainability score across the last six analyses",
  bars: [{ label: "MAR 01", value: 61 }, { label: "MAR 08", value: 66 }, { label: "MAR 15", value: 70 }, { label: "MAR 22", value: 76 }, { label: "MAR 29", value: 82 }, { label: "TODAY", value: 91 }],
  listTitle: "Priority improvements",
  rows: [
    { title: "Split checkout controller", detail: "src/api/checkout.ts · 284 lines", value: "High impact", status: "Suggested", tone: "orange" },
    { title: "Reduce nested conditionals", detail: "src/lib/pricing.ts · complexity 18", value: "Medium", status: "Review", tone: "blue" },
    { title: "Remove duplicate validators", detail: "src/forms/ · 6 repeated blocks", value: "Quick win", status: "Suggested", tone: "neutral" },
  ],
};

const securityView: SectionData = {
  eyebrow: "THREAT OVERVIEW",
  description: "Prioritized dependency and application risks, organized around what needs attention first.",
  metrics: [
    { label: "Security score", value: "78", change: "+2 pts", icon: ShieldCheck, tone: "orange" },
    { label: "Critical issues", value: "0", change: "No change", icon: LockKeyhole, tone: "green" },
    { label: "High severity", value: "2", change: "Needs review", icon: AlertTriangle, tone: "blue" },
    { label: "Dependencies", value: "14", change: "Updates available", icon: Layers3, tone: "violet" },
  ],
  chartTitle: "Findings by severity",
  chartCaption: "Open findings in the current repository scan",
  bars: [{ label: "CRITICAL", value: 4 }, { label: "HIGH", value: 30 }, { label: "MEDIUM", value: 63 }, { label: "LOW", value: 38 }, { label: "INFO", value: 19 }],
  listTitle: "Open security findings",
  rows: [
    { title: "Update jsonwebtoken", detail: "CVE-2025-24103 · dependency", value: "High", status: "Patch available", tone: "orange" },
    { title: "Restrict upload content types", detail: "src/api/uploads.ts · application", value: "Medium", status: "Needs review", tone: "blue" },
    { title: "Rotate development token", detail: "Environment variable · secret hygiene", value: "Low", status: "Suggested", tone: "neutral" },
  ],
};

const testingView: SectionData = {
  eyebrow: "TEST HEALTH",
  description: "See coverage gaps, suite reliability, and the paths that need stronger regression protection.",
  metrics: [
    { label: "Coverage", value: "84%", change: "+8.2%", icon: CircleDot, tone: "orange" },
    { label: "Tests passed", value: "142", change: "of 145", icon: Check, tone: "green" },
    { label: "Flaky tests", value: "3", change: "-2 this week", icon: Activity, tone: "blue" },
    { label: "Test suites", value: "12", change: "All active", icon: Layers3, tone: "violet" },
  ],
  chartTitle: "Coverage by area",
  chartCaption: "Line coverage across key parts of the application",
  bars: [{ label: "API", value: 92 }, { label: "UI", value: 78 }, { label: "AUTH", value: 88 }, { label: "DATA", value: 81 }, { label: "CHECKOUT", value: 64 }],
  listTitle: "Test suite health",
  rows: [
    { title: "API integration", detail: "48 tests · 2m 14s", value: "96%", status: "Passing", tone: "green" },
    { title: "Checkout flow", detail: "21 tests · missing edge coverage", value: "64%", status: "Needs tests", tone: "orange" },
    { title: "Authentication", detail: "32 tests · 1 flaky case", value: "88%", status: "Review", tone: "blue" },
  ],
};

const documentationView: SectionData = {
  eyebrow: "DOCUMENTATION HEALTH",
  description: "Make project knowledge easier to find with a practical view of docs coverage and freshness.",
  metrics: [
    { label: "Docs coverage", value: "72%", change: "+9%", icon: BookOpen, tone: "orange" },
    { label: "README", value: "100%", change: "Up to date", icon: FileCode2, tone: "green" },
    { label: "API reference", value: "56%", change: "6 endpoints missing", icon: Code2, tone: "blue" },
    { label: "Stale pages", value: "4", change: "Over 90 days", icon: Clock3, tone: "violet" },
  ],
  chartTitle: "Documentation coverage",
  chartCaption: "Documentation coverage by project area",
  bars: [{ label: "SETUP", value: 100 }, { label: "API", value: 56 }, { label: "ARCH", value: 68 }, { label: "TESTS", value: 72 }, { label: "DEPLOY", value: 84 }],
  listTitle: "Recommended documentation",
  rows: [
    { title: "Document payment retry behavior", detail: "src/billing/retry.ts · no guide found", value: "High value", status: "Suggested", tone: "orange" },
    { title: "Add API examples for webhooks", detail: "Public API · 4 event types", value: "Medium", status: "Suggested", tone: "blue" },
    { title: "Refresh local setup instructions", detail: "README.md · last checked 104 days ago", value: "Quick win", status: "Stale", tone: "neutral" },
  ],
};

const performanceView: SectionData = {
  eyebrow: "RUNTIME HEALTH",
  description: "Track loading speed, bundle weight, and response times with clear signals for the next optimization.",
  metrics: [
    { label: "Largest paint", value: "1.7s", change: "-220ms", icon: Zap, tone: "orange" },
    { label: "API p95", value: "240ms", change: "-8%", icon: Activity, tone: "blue" },
    { label: "Bundle size", value: "342KB", change: "Within budget", icon: Layers3, tone: "violet" },
    { label: "Regressions", value: "0", change: "No regressions", icon: Check, tone: "green" },
  ],
  chartTitle: "Response time trend",
  chartCaption: "Median API response time over the last six deploys",
  bars: [{ label: "MAR 01", value: 81 }, { label: "MAR 08", value: 73 }, { label: "MAR 15", value: 67 }, { label: "MAR 22", value: 59 }, { label: "MAR 29", value: 54 }, { label: "TODAY", value: 48 }],
  listTitle: "Optimization opportunities",
  rows: [
    { title: "Defer below-the-fold images", detail: "src/pages/catalog.tsx · image loading", value: "-180ms", status: "Suggested", tone: "orange" },
    { title: "Split analytics bundle", detail: "vendor chunk · 92KB unused on entry", value: "-92KB", status: "Quick win", tone: "blue" },
    { title: "Cache product summary query", detail: "GET /api/catalog · repeated request", value: "-65ms", status: "Review", tone: "neutral" },
  ],
};

const deploymentView: SectionData = {
  eyebrow: "RELEASE READINESS",
  description: "Check the production path from build to verification and see what could block your next release.",
  metrics: [
    { label: "Readiness", value: "92%", change: "+4%", icon: Gauge, tone: "orange" },
    { label: "Environments", value: "3", change: "All connected", icon: Network, tone: "blue" },
    { label: "Checks passed", value: "18/20", change: "2 to review", icon: Check, tone: "green" },
    { label: "Last deploy", value: "11:24", change: "Today", icon: Clock3, tone: "violet" },
  ],
  chartTitle: "Pipeline checks",
  chartCaption: "Current readiness across deployment gates",
  bars: [{ label: "BUILD", value: 100 }, { label: "TESTS", value: 96 }, { label: "SECURITY", value: 78 }, { label: "STAGING", value: 92 }, { label: "RELEASE", value: 88 }],
  listTitle: "Environments & release checks",
  rows: [
    { title: "Production", detail: "Last deploy · main · 11:24 AM", value: "Healthy", status: "Live", tone: "green" },
    { title: "Staging", detail: "Build #482 · all smoke tests passed", value: "Ready", status: "Passed", tone: "green" },
    { title: "Security gate", detail: "2 high-severity findings need review", value: "Review", status: "Attention", tone: "orange" },
  ],
};

const views: Record<string, SectionData> = {
  "Code Quality": qualityView,
  Security: securityView,
  Testing: testingView,
  Documentation: documentationView,
  Performance: performanceView,
  Deployment: deploymentView,
  "Git Practices": {
    eyebrow: "COLLABORATION HEALTH",
    description: "Review branch hygiene, pull request flow, and the habits that keep changes safe to ship.",
    metrics: [
      { label: "PR cycle time", value: "8.4h", change: "-1.2h", icon: GitPullRequest, tone: "orange" },
      { label: "Review coverage", value: "96%", change: "+3%", icon: Check, tone: "green" },
      { label: "Stale branches", value: "4", change: "2 older than 30d", icon: GitBranch, tone: "blue" },
      { label: "Contributors", value: "12", change: "This month", icon: Activity, tone: "violet" },
    ],
    chartTitle: "Pull request activity",
    chartCaption: "Merged changes over the last six weeks",
    bars: [{ label: "WEEK 1", value: 48 }, { label: "WEEK 2", value: 62 }, { label: "WEEK 3", value: 54 }, { label: "WEEK 4", value: 78 }, { label: "WEEK 5", value: 71 }, { label: "WEEK 6", value: 92 }],
    listTitle: "Repository practices",
    rows: [
      { title: "Protect the main branch", detail: "Require review before merge", value: "Enabled", status: "Healthy", tone: "green" },
      { title: "Close inactive feature branches", detail: "4 branches older than 30 days", value: "4 open", status: "Suggested", tone: "orange" },
      { title: "Keep pull requests focused", detail: "Median change size · 186 lines", value: "Good", status: "On track", tone: "blue" },
    ],
  },
};

const architectureMetrics: Metric[] = [
  { label: "Modules", value: "18", change: "+2 this month", icon: Layers3, tone: "orange" },
  { label: "Dependencies", value: "62", change: "4 outdated", icon: Network, tone: "blue" },
  { label: "Circular links", value: "0", change: "Clear", icon: Check, tone: "green" },
  { label: "Coupling", value: "0.18", change: "Low", icon: Activity, tone: "violet" },
];

function SectionMetricGrid({ items }: { items: Metric[] }) {
  return (
    <div className={styles.detailMetricGrid}>
      {items.map(({ label, value, change, icon: Icon, tone }) => (
        <article className={styles.detailMetric} key={label}>
          <span className={`${styles.detailMetricIcon} ${styles[`tone${tone}`]}`}><Icon size={17} /></span>
          <span className={styles.detailMetricLabel}>{label}</span>
          <strong>{value}</strong>
          <small>{change}</small>
        </article>
      ))}
    </div>
  );
}

function DetailBars({ items }: { items: { label: string; value: number }[] }) {
  return (
    <div className={styles.detailBars}>
      {items.map(({ label, value }) => (
        <div className={styles.detailBarColumn} key={label}>
          <span className={styles.detailBarValue}>{value}%</span>
          <div className={styles.detailBarTrack}><span style={{ height: `${value}%` }} /></div>
          <span className={styles.detailBarLabel}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function ArchitectureView({ onAction }: { onAction: SectionViewProps["onAction"] }) {
  return (
    <>
      <div className={styles.detailIntro}><span className={styles.detailEyebrow}>SYSTEM MAP</span><p>Explore module boundaries, dependency flow, and architectural hotspots across the repository.</p></div>
      <SectionMetricGrid items={architectureMetrics} />
      <section className={styles.architectureViewGrid}>
        <article className={styles.detailPanel}>
          <div className={styles.detailPanelHeader}><div><span className={styles.detailEyebrow}>WEATHER-APP · MAIN</span><h2>Service topology</h2></div><span className={styles.detailStatus}><i /> 18 modules mapped</span></div>
          <div className={styles.moduleMap}>
            <div className={`${styles.moduleNode} ${styles.moduleEntry}`}><span><Code2 size={16} /></span><strong>Web app</strong><small>Next.js · 24 files</small></div>
            <div className={styles.moduleConnector} />
            <div className={styles.moduleNode}><span><Activity size={16} /></span><strong>API layer</strong><small>REST · 18 routes</small></div>
            <div className={styles.moduleBranches}><i /><i /><i /></div>
            <div className={styles.moduleTargets}>
              <div className={styles.moduleNode}><span><Layers3 size={16} /></span><strong>Services</strong><small>8 modules</small></div>
              <div className={styles.moduleNode}><span><Network size={16} /></span><strong>Data layer</strong><small>6 modules</small></div>
              <div className={styles.moduleNode}><span><ShieldCheck size={16} /></span><strong>Auth</strong><small>4 modules</small></div>
            </div>
          </div>
          <div className={styles.moduleLegend}><span><i /> Application</span><span><i /> Service</span><span><i /> Data / infrastructure</span></div>
        </article>
        <article className={styles.detailPanel}>
          <div className={styles.detailPanelHeader}><div><span className={styles.detailEyebrow}>ARCHITECTURE NOTES</span><h2>Things to keep an eye on</h2></div></div>
          <div className={styles.architectureNotes}>
            <div><span className={`${styles.noteIcon} ${styles.tonegreen}`}><Check size={16} /></span><span><strong>Boundaries are clean</strong><small>No circular module references detected.</small></span><span className={styles.notePill}>Healthy</span></div>
            <div><span className={`${styles.noteIcon} ${styles.toneorange}`}><AlertTriangle size={16} /></span><span><strong>Billing depends on shared utils</strong><small>Consider extracting currency helpers.</small></span><span className={styles.notePill}>Review</span></div>
            <div><span className={`${styles.noteIcon} ${styles.toneblue}`}><ArrowDownRight size={16} /></span><span><strong>API layer is growing</strong><small>18 routes share one service boundary.</small></span><span className={styles.notePill}>Monitor</span></div>
          </div>
          <button className={styles.detailAction} type="button" onClick={() => onAction("Architecture map exported.")}>Export architecture map <ArrowRight size={15} /></button>
        </article>
      </section>
    </>
  );
}

export default function SectionView({ section, onAction }: SectionViewProps) {
  if (section === "Architecture") return <ArchitectureView onAction={onAction} />;

  const data = views[section] ?? qualityView;
  return (
    <>
      <div className={styles.detailIntro}><span className={styles.detailEyebrow}>{data.eyebrow}</span><p>{data.description}</p></div>
      <SectionMetricGrid items={data.metrics} />
      <section className={styles.detailColumns}>
        <article className={styles.detailPanel}>
          <div className={styles.detailPanelHeader}><div><span className={styles.detailEyebrow}>SIGNALS &amp; TRENDS</span><h2>{data.chartTitle}</h2><p>{data.chartCaption}</p></div><span className={styles.chartPeriod}>Last 30 days <ArrowUpRight size={13} /></span></div>
          <DetailBars items={data.bars} />
        </article>
        <article className={styles.detailPanel}>
          <div className={styles.detailPanelHeader}><div><span className={styles.detailEyebrow}>NEXT BEST ACTIONS</span><h2>{data.listTitle}</h2></div><span className={styles.rowCount}>{data.rows.length} items</span></div>
          <div className={styles.detailRows}>
            {data.rows.map((row) => (
              <div className={styles.detailRow} key={row.title}>
                <span className={`${styles.rowStatusIcon} ${styles[`tone${row.tone}`]}`}>{row.tone === "green" ? <Check size={15} /> : row.tone === "orange" ? <AlertTriangle size={15} /> : <FileCode2 size={15} />}</span>
                <span className={styles.detailRowCopy}><strong>{row.title}</strong><small>{row.detail}</small></span>
                <span className={styles.detailRowValue}>{row.value}</span>
                <span className={`${styles.detailRowBadge} ${styles[`badge${row.tone}`]}`}>{row.status}</span>
                <ArrowRight className={styles.detailRowArrow} size={15} />
              </div>
            ))}
          </div>
          <button className={styles.detailAction} type="button" onClick={() => onAction(`${section} report exported.`)}>Export {section.toLowerCase()} report <ArrowRight size={15} /></button>
        </article>
      </section>
      <section className={styles.insightBanner}>
        <span className={styles.insightIcon}><Zap size={18} /></span>
        <span><strong>Keep this area moving forward</strong><small>Re-run the analysis after your next merge to compare the latest results.</small></span>
        <span className={styles.insightUpdated}><Clock3 size={14} /> Updated today</span>
      </section>
    </>
  );
}
