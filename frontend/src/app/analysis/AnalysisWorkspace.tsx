"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CircleDot,
  Clock3,
  Code2,
  Download,
  FileCode2,
  GitBranch,
  GitPullRequest,
  Gauge,
  Home,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Moon,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import styles from "./analysis.module.css";
import SectionView from "./SectionView";
import MetricCard from "@/components/dashboard/MetricCard";
import RepoWorkspaceCard from "@/components/dashboard/RepoWorkspaceCard";
import PerformanceImpactChart from "@/components/dashboard/PerformanceImpactChart";
import RepositoryListCard from "@/components/dashboard/RepositoryListCard";

const repositories = ["weather-app", "spark-core", "commerce-api", "mobile-client"];

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Code Quality", icon: Code2 },
  { label: "Security", icon: ShieldCheck },
  { label: "Testing", icon: CircleDot },
  { label: "Performance", icon: Gauge },
];

const metrics = [
  { label: "Security", score: 78, delta: "+2.1%", icon: ShieldCheck, color: "blue" as const, targetSection: "Security" },
  { label: "Performance", score: 82, delta: "+4.7%", icon: Gauge, color: "green" as const, targetSection: "Performance" },
  { label: "Code quality", score: 91, delta: "+6.4%", icon: Code2, color: "orange" as const, targetSection: "Code Quality" },
  { label: "Testing", score: 84, delta: "+8.2%", icon: CircleDot, color: "violet" as const, targetSection: "Testing" },
];

const recentFindings = [
  { icon: AlertTriangle, title: "Add checkout flow integration tests", detail: "Testing · High impact", badge: "Recommended", tone: "orange" },
  { icon: LockKeyhole, title: "Update 2 dependencies with known advisories", detail: "Security · Review", badge: "Review", tone: "blue" },
  { icon: FileCode2, title: "Split the API client module", detail: "Code quality · Improvement", badge: "Suggested", tone: "neutral" },
];

export default function AnalysisWorkspace() {
  const [activeSection, setActiveSection] = useState("Overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [project, setProject] = useState("weather-app");
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [repoSearch, setRepoSearch] = useState("");
  const [repoSearchOpen, setRepoSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [analysisKey, setAnalysisKey] = useState(0);
  const [scoreProgress, setScoreProgress] = useState(1);
  const scoreAnimationFrame = useRef<number | null>(null);

  useEffect(() => () => {
    if (scoreAnimationFrame.current !== null) window.cancelAnimationFrame(scoreAnimationFrame.current);
  }, []);

  const filteredRepositories = useMemo(
    () => repositories.filter((repository) => repository.toLowerCase().includes(repoSearch.toLowerCase())),
    [repoSearch],
  );

  const chooseProject = (repository: string) => {
    setProject(repository);
    setRepoSearch("");
    setProjectMenuOpen(false);
    setRepoSearchOpen(false);
  };

  const exportReport = () => {
    const report = [
      "SPARK AI Repository Analysis",
      `Repository,${project}`,
      "Overall score,84/100",
      ...metrics.map((metric) => `${metric.label},${metric.score}/100`),
    ].join("\n");
    const blob = new Blob([report], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${project}-analysis.csv`;
    downloadLink.click();
    URL.revokeObjectURL(url);
  };

  const handleReanalyze = () => {
    setToast("Analysis queued. Your report will refresh shortly.");
    setAnalysisKey((prev) => prev + 1);
    if (scoreAnimationFrame.current !== null) window.cancelAnimationFrame(scoreAnimationFrame.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setScoreProgress(1);
      window.setTimeout(() => setToast(""), 3600);
      return;
    }

    setScoreProgress(0);
    let startedAt: number | null = null;
    const animate = (timestamp: number) => {
      startedAt ??= timestamp;
      const progress = Math.min((timestamp - startedAt) / 900, 1);
      setScoreProgress(progress);
      if (progress < 1) {
        scoreAnimationFrame.current = window.requestAnimationFrame(animate);
      } else {
        scoreAnimationFrame.current = null;
        window.setTimeout(() => setToast(""), 3600);
      }
    };
    scoreAnimationFrame.current = window.requestAnimationFrame(animate);
  };

  return (
    <div className={`${styles.shell} ${darkMode ? styles.darkMode : ""} ${collapsed ? styles.isCollapsed : ""}`}>
      <aside className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarOpen : ""}`} aria-label="Repository analysis navigation">
        <div className={styles.sidebarTop}>
          <Link className={styles.sidebarBrand} href="/" aria-label="SPARK AI home">
            <span className={styles.brandMark}><Sparkles size={18} strokeWidth={2.4} /></span>
            {!collapsed && <span className={styles.brandName}>SPARK<span>AI</span></span>}
          </Link>
          <button className={styles.collapseButton} type="button" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(!collapsed)}>
            <Menu size={18} />
          </button>
        </div>

        {!collapsed && <div className={styles.sidebarCaption}>WORKSPACE</div>}
        <nav className={styles.sideNav}>
          {navigation.map(({ label, icon: Icon }) => (
            <button
              aria-current={activeSection === label ? "page" : undefined}
              className={`${styles.navItem} ${activeSection === label ? styles.navItemActive : ""}`}
              key={label}
              onClick={() => { setActiveSection(label); setMobileNavOpen(false); }}
              title={collapsed ? label : undefined}
              type="button"
            >
              <Icon size={18} strokeWidth={1.8} />
              {!collapsed && <span>{label}</span>}
              {!collapsed && activeSection === label && <span className={styles.activeIndicator} />}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          {!collapsed && <div className={styles.planCard}>
            <div className={styles.planIcon}><Sparkles size={16} /></div>
            <strong>Make room to improve.</strong>
            <span>Your next insight is one analysis away.</span>
            <button type="button" onClick={handleReanalyze}>Run analysis <ArrowRight size={14} /></button>
          </div>}
          <Link href="/" className={styles.settingsLink} title={collapsed ? "Landing page" : undefined}>
            <Home size={17} />{!collapsed && <span>Landing page</span>}
          </Link>
          <button className={styles.settingsLink} type="button" onClick={() => setActiveSection("Settings")} title={collapsed ? "Settings" : undefined}>
            <Settings size={17} />{!collapsed && <span>Settings</span>}
          </button>
          <button className={styles.helpLink} type="button" onClick={() => setToast("Help center opened in a new workspace.")} title={collapsed ? "Help center" : undefined}>
            <CircleHelp size={17} />{!collapsed && <span>Help center</span>}
          </button>
        </div>
      </aside>

      {mobileNavOpen && <button className={styles.mobileScrim} aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} type="button" />}

      <div className={styles.mainColumn}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button className={styles.mobileMenuButton} type="button" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
            <Link className={styles.topbarBrand} href="/" aria-label="SPARK AI home">
              <span className={styles.brandMark}><Sparkles size={16} strokeWidth={2.4} /></span>
              <span className={styles.brandName}>SPARK<span>AI</span></span>
            </Link>
            <span className={styles.topbarDivider} />
            <div className={styles.projectPickerWrap}>
              <button className={styles.projectPicker} type="button" aria-expanded={projectMenuOpen} onClick={() => setProjectMenuOpen(!projectMenuOpen)}>
                <span className={styles.projectStatus} />
                <span className={styles.projectPrefix}>Project</span>
                <strong>{project}</strong>
                <ChevronDown size={15} />
              </button>
              {projectMenuOpen && <div className={styles.projectMenu}>
                <span className={styles.popoverLabel}>SWITCH PROJECT</span>
                {repositories.map((repository) => <button className={styles.projectOption} key={repository} onClick={() => chooseProject(repository)} type="button"><GitBranch size={15} /><span>{repository}</span>{repository === project && <Check size={15} />}</button>)}
              </div>}
            </div>
          </div>

          <div className={styles.topbarActions}>
            <div className={styles.repoSearchWrap}>
              <Search className={styles.searchIcon} size={17} />
              <input
                aria-label="Search and switch repositories"
                onBlur={() => window.setTimeout(() => setRepoSearchOpen(false), 120)}
                onChange={(event) => { setRepoSearch(event.target.value); setRepoSearchOpen(true); }}
                onFocus={() => setRepoSearchOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && filteredRepositories[0]) chooseProject(filteredRepositories[0]);
                  if (event.key === "Escape") setRepoSearchOpen(false);
                }}
                placeholder="Switch repository..."
                value={repoSearch}
              />
              <kbd>⌘ K</kbd>
              {repoSearchOpen && repoSearch && <div className={styles.searchResults}>
                <span className={styles.popoverLabel}>REPOSITORIES</span>
                {filteredRepositories.length > 0 ? filteredRepositories.map((repository) => <button className={styles.searchResult} key={repository} onMouseDown={() => chooseProject(repository)} type="button"><GitBranch size={15} /><span>{repository}</span><ArrowUpRight size={14} /></button>) : <span className={styles.emptySearch}>No repositories found</span>}
              </div>}
            </div>
            <div className={styles.notificationWrap}>
              <button className={styles.iconButton} type="button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <Bell size={18} /><span className={styles.notificationDot} />
              </button>
              {notificationsOpen && <div className={styles.notificationMenu}>
                <div className={styles.notificationHeading}><strong>Notifications</strong><span>2 new</span></div>
                <div className={styles.notificationItem}><span className={styles.notificationIcon}><ShieldCheck size={16} /></span><span><strong>Security scan complete</strong><small>{project} · 4 min ago</small></span></div>
                <div className={styles.notificationItem}><span className={styles.notificationIcon}><Activity size={16} /></span><span><strong>New recommendation ready</strong><small>{project} · 18 min ago</small></span></div>
              </div>}
            </div>
            <button className={styles.iconButton} type="button" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className={styles.profileButton} type="button" aria-label="Open profile menu" onClick={() => setToast("Signed in as Aarav Singh")}><span>AS</span><i /></button>
          </div>
        </header>

        <main className={styles.content}>
          <div className={styles.pageHeading}>
            <div>
              <div className={styles.breadcrumb}>
                <Link href="/" className="hover:text-[#ff5722] transition-colors inline-flex items-center gap-1 font-medium">
                  <ArrowLeft size={13} />
                  <span>Landing page</span>
                </Link>
                <ChevronRight size={14} />
                <span>Repositories</span>
                <ChevronRight size={14} />
                <strong>{project}</strong>
              </div>
              <div className={styles.titleLine}><h1>{activeSection === "Overview" ? "Dashboard" : activeSection}</h1><span className={styles.analysisStatus}><i /> ANALYSIS COMPLETE</span></div>
              <p className={styles.pageDescription}>A clear view of your project health, with the next best improvements in reach.</p>
            </div>
            <div className={styles.headingActions}>
              <button className={styles.runButton} type="button" onClick={handleReanalyze}><Activity size={16} /> Re-analyze</button>
            </div>
          </div>

          {activeSection === "Overview" ? (
            <div className="space-y-6">
              {/* Row 1: Left is Active Repo Workspace & Upload Card (Total Balance equivalent), Right is 2x2 Metric Cards */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
                <div className="xl:col-span-5 h-full">
                  <RepoWorkspaceCard
                    currentProject={project}
                    onSelectProject={chooseProject}
                    onAnalyze={handleReanalyze}
                    onDownloadReport={exportReport}
                    isAnalyzing={scoreProgress < 1 && scoreProgress > 0}
                  />
                </div>

                <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {metrics.map(({ label, score, delta, icon: Icon, color, targetSection }, index) => (
                    <MetricCard
                      key={label}
                      label={label}
                      score={score}
                      delta={delta}
                      icon={Icon}
                      color={color}
                      index={index}
                      animationKey={analysisKey}
                      onClick={() => setActiveSection(targetSection)}
                    />
                  ))}
                </div>
              </div>

              {/* Row 2: Left is Performance After Changes Graph (Cashflow Overview equivalent), Right is Uploaded Repositories List (My Card equivalent) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
                <div className="xl:col-span-7 h-full">
                  <PerformanceImpactChart />
                </div>

                <div className="xl:col-span-5 h-full">
                  <RepositoryListCard
                    currentProject={project}
                    onSelectProject={chooseProject}
                    onAddNew={() => setToast("Ready to connect a new repository.")}
                  />
                </div>
              </div>
            </div>
          ) : (
            <SectionView section={activeSection} onAction={setToast} />
          )}
          <footer className={styles.pageFooter}><span>SPARK AI · Analysis snapshot for {project}</span><span><i /> All systems operational</span></footer>
        </main>
      </div>

      {toast && <div className={styles.toast} role="status"><Check size={16} />{toast}<button type="button" aria-label="Dismiss notification" onClick={() => setToast("")}><X size={15} /></button></div>}
    </div>
  );
}
