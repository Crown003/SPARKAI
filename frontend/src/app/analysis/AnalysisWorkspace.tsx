"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
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
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Moon,
  MoreHorizontal,
  Network,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
  Zap,
} from "lucide-react";
import styles from "./analysis.module.css";
import SectionView from "./SectionView";

const repositories = ["weather-app", "spark-core", "commerce-api", "mobile-client"];

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Code Quality", icon: Code2 },
  { label: "Security", icon: ShieldCheck },
  { label: "Architecture", icon: Network },
  { label: "Testing", icon: CircleDot },
  { label: "Documentation", icon: BookOpen },
  { label: "Performance", icon: Gauge },
  { label: "Deployment", icon: Zap },
  { label: "Git Practices", icon: GitBranch },
];

const metrics = [
  { label: "Code quality", score: 91, delta: "+6.4%", icon: Code2, color: "orange" },
  { label: "Security", score: 78, delta: "+2.1%", icon: ShieldCheck, color: "blue" },
  { label: "Testing", score: 84, delta: "+8.2%", icon: CircleDot, color: "violet" },
  { label: "Performance", score: 82, delta: "+4.7%", icon: Gauge, color: "green" },
];

const recentFindings = [
  { icon: AlertTriangle, title: "Add checkout flow integration tests", detail: "Testing · High impact", badge: "Recommended", tone: "orange" },
  { icon: LockKeyhole, title: "Update 2 dependencies with known advisories", detail: "Security · Review", badge: "Review", tone: "blue" },
  { icon: FileCode2, title: "Split the API client module", detail: "Code quality · Improvement", badge: "Suggested", tone: "neutral" },
];

function ScoreRing({ score, size = "small" }: { score: number; size?: "small" | "large" }) {
  return (
    <div
      className={`${styles.scoreRing} ${size === "large" ? styles.scoreRingLarge : ""}`}
      style={{ "--score": `${score}%` } as CSSProperties}
      role="img"
      aria-label={`${score} out of 100`}
    >
      <div className={styles.scoreRingCenter}>
        <strong>{score}</strong>
        <span>/100</span>
      </div>
    </div>
  );
}

function TrendChart() {
  return (
    <svg className={styles.trendChart} viewBox="0 0 620 180" role="img" aria-label="Repository health trend over the last six analyses">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff6a37" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ff6a37" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className={styles.chartGrid}>
        <path d="M44 28H600M44 66H600M44 104H600M44 142H600" />
        <path d="M44 20V142M155 20V142M266 20V142M377 20V142M488 20V142M599 20V142" />
      </g>
      <path className={styles.trendArea} d="M44 119 C86 114 113 104 155 108 S225 94 266 98 S335 74 377 82 S448 63 488 69 S559 43 599 36 V142 H44Z" />
      <path className={styles.trendLine} d="M44 119 C86 114 113 104 155 108 S225 94 266 98 S335 74 377 82 S448 63 488 69 S559 43 599 36" />
      <g className={styles.chartPoints}>
        <circle cx="44" cy="119" r="4" /><circle cx="155" cy="108" r="4" /><circle cx="266" cy="98" r="4" />
        <circle cx="377" cy="82" r="4" /><circle cx="488" cy="69" r="4" /><circle cx="599" cy="36" r="5" />
      </g>
      <g className={styles.chartLabels}>
        <text x="44" y="164">MAR 01</text><text x="155" y="164">MAR 08</text><text x="266" y="164">MAR 15</text>
        <text x="377" y="164">MAR 22</text><text x="488" y="164">MAR 29</text><text x="599" y="164">TODAY</text>
      </g>
    </svg>
  );
}

function RadarChart() {
  return (
    <svg className={styles.radarChart} viewBox="0 0 320 275" role="img" aria-label="Five-axis repository score breakdown">
      <g className={styles.radarGrid}>
        <polygon points="160,36 251,102 216,210 104,210 69,102" />
        <polygon points="160,59 229,109 203,192 117,192 91,109" />
        <polygon points="160,82 208,117 190,175 130,175 112,117" />
        <polygon points="160,105 186,124 177,157 143,157 134,124" />
        <path d="M160 133V36M160 133l91-31M160 133l56 77M160 133l-56 77M160 133l-91-31" />
      </g>
      <polygon className={styles.radarShape} points="160,51 226,110 202,184 119,188 94,110" />
      <g className={styles.radarDots}><circle cx="160" cy="51" r="4" /><circle cx="226" cy="110" r="4" /><circle cx="202" cy="184" r="4" /><circle cx="119" cy="188" r="4" /><circle cx="94" cy="110" r="4" /></g>
      <g className={styles.radarLabels}>
        <text x="160" y="21" textAnchor="middle">Code quality</text>
        <text x="269" y="98" textAnchor="start">Security</text>
        <text x="231" y="235" textAnchor="start">Testing</text>
        <text x="89" y="235" textAnchor="end">Architecture</text>
        <text x="51" y="98" textAnchor="end">Performance</text>
      </g>
    </svg>
  );
}

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
    window.setTimeout(() => setToast(""), 3600);
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
              <div className={styles.breadcrumb}><span>Repositories</span><ChevronRight size={14} /><strong>{project}</strong></div>
              <div className={styles.titleLine}><h1>{activeSection === "Overview" ? "Dashboard" : activeSection}</h1><span className={styles.analysisStatus}><i /> ANALYSIS COMPLETE</span></div>
              <p className={styles.pageDescription}>A clear view of your project health, with the next best improvements in reach.</p>
            </div>
            <div className={styles.headingActions}>
              <button className={styles.exportButton} type="button" onClick={exportReport}><Download size={16} /> Export report</button>
              <button className={styles.runButton} type="button" onClick={handleReanalyze}><Activity size={16} /> Re-analyze</button>
            </div>
          </div>

          {activeSection === "Overview" ? (
            <>
          <section className={styles.metricGrid} aria-label="Repository health metrics">
            {metrics.map(({ label, score, delta, icon: Icon, color }) => (
              <article className={styles.metricCard} key={label}>
                <div className={styles.metricTop}><span className={`${styles.metricIcon} ${styles[color]}`}><Icon size={18} /></span><span className={styles.metricTrend}><ArrowUpRight size={14} /> {delta}</span></div>
                <div className={styles.metricBottom}><div><span>{label}</span><strong>{score}</strong></div><div className={`${styles.miniRing} ${styles[color]}`} style={{ "--score": `${score}%` } as CSSProperties}><span>{score}</span></div></div>
                <div className={styles.metricProgress}><span className={styles[color]} style={{ width: `${score}%` }} /></div>
              </article>
            ))}
          </section>

          <section className={styles.primaryGrid} aria-label="Project summary and code health">
            <article className={`${styles.panel} ${styles.overviewPanel}`}>
              <div className={styles.panelHeader}><div><span className={styles.sectionEyebrow}>PROJECT HEALTH</span><h2>Overall score</h2></div><button className={styles.moreButton} type="button" aria-label="More score options"><MoreHorizontal size={19} /></button></div>
              <div className={styles.scoreSummary}>
                <ScoreRing score={84} size="large" />
                <div className={styles.scoreComment}><span className={styles.healthBadge}><i /> Strong foundation</span><p>Your codebase is in good shape. A few focused fixes can make it even stronger.</p><span className={styles.scoreChange}><ArrowUpRight size={15} /> 12 points since last analysis</span></div>
              </div>
              <div className={styles.overviewFooter}><span><Clock3 size={15} /> Analyzed today, 10:42 AM</span><span><FileCode2 size={15} /> 248 files scanned</span></div>
            </article>

            <article className={`${styles.panel} ${styles.trendPanel}`}>
              <div className={styles.panelHeader}><div><span className={styles.sectionEyebrow}>STEADY PROGRESS</span><h2>Health over time</h2></div><button className={styles.rangeButton} type="button">Last 30 days <ChevronDown size={14} /></button></div>
              <div className={styles.trendSummary}><strong>84<span>/100</span></strong><span className={styles.trendGood}><ArrowUpRight size={14} /> +12.8%</span><small>compared to previous period</small></div>
              <TrendChart />
            </article>
          </section>

          <section className={styles.secondaryGrid} aria-label="Score breakdown and recommendations">
            <article className={styles.radarPanel}>
              <div className={styles.radarHeader}><div><span>PROJECT DNA</span><h2>Score breakdown</h2></div><button type="button" aria-label="More score breakdown options"><MoreHorizontal size={19} /></button></div>
              <RadarChart />
              <div className={styles.radarLegend}><span><i /> Your score</span><span><i /> Team average</span><strong>84 <small>/ 100</small></strong></div>
            </article>

            <article className={styles.recommendationPanel}>
              <div className={styles.panelHeader}><div><span className={styles.sectionEyebrow}>SPARK SUGGESTS</span><h2>Worth a closer look</h2></div><span className={styles.recommendationCount}>3 insights</span></div>
              <div className={styles.findingList}>
                {recentFindings.map(({ icon: Icon, title, detail, badge, tone }) => (
                  <div className={styles.finding} key={title}>
                    <span className={`${styles.findingIcon} ${styles[`finding${tone}`]}`}><Icon size={17} /></span>
                    <span className={styles.findingCopy}><strong>{title}</strong><small>{detail}</small></span>
                    <span className={`${styles.findingBadge} ${styles[`badge${tone}`]}`}>{badge}</span>
                    <ChevronRight className={styles.findingArrow} size={16} />
                  </div>
                ))}
              </div>
              <button className={styles.allFindings} type="button" onClick={() => setActiveSection("Code Quality")}>View all recommendations <ArrowRight size={15} /></button>
            </article>
          </section>

          <section className={styles.activityPanel} aria-label="Recent repository activity">
            <div className={styles.panelHeader}><div><span className={styles.sectionEyebrow}>REPOSITORY PULSE</span><h2>Recent activity</h2></div><button className={styles.activityLink} type="button" onClick={() => setActiveSection("Git Practices")}>View activity <ArrowRight size={15} /></button></div>
            <div className={styles.activityGrid}>
              <div className={styles.activityItem}><span className={`${styles.activityIcon} ${styles.orange}`}><GitPullRequest size={17} /></span><span><strong>Pull request merged</strong><small>feat/add-search · by Maya Chen</small></span><time>24 min ago</time></div>
              <div className={styles.activityItem}><span className={`${styles.activityIcon} ${styles.blue}`}><GitBranch size={17} /></span><span><strong>Branch updated</strong><small>fix/session-timeout · 3 commits</small></span><time>1 hr ago</time></div>
              <div className={styles.activityItem}><span className={`${styles.activityIcon} ${styles.green}`}><Check size={17} /></span><span><strong>Checks passed</strong><small>CI pipeline · main branch</small></span><time>2 hrs ago</time></div>
            </div>
          </section>
            </>
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
