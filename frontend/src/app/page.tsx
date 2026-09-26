"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  CircleDot,
  Clock3,
  Code2,
  FileCode2,
  GitFork as Github,
  GitBranch,
  LockKeyhole,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react";

const featureCards = [
  {
    icon: FileCode2,
    title: "Comprehensive analysis",
    description: "Understand code health, architecture, and maintainability at a glance.",
    tone: "coral",
  },
  {
    icon: ShieldCheck,
    title: "Security first",
    description: "Catch vulnerabilities and risky dependencies before release.",
    tone: "green",
  },
  {
    icon: Sparkles,
    title: "AI recommendations",
    description: "Get prioritized next steps tailored to your repository.",
    tone: "blue",
  },
  {
    icon: BarChart3,
    title: "Visual insights",
    description: "See project health and code trends in clear visual reports.",
    tone: "blue",
  },
  {
    icon: FileCode2,
    title: "Detailed reports",
    description: "Turn findings into a focused plan your team can share.",
    tone: "coral",
  },
  {
    icon: Clock3,
    title: "Track history",
    description: "Compare progress across analyses and follow improvements.",
    tone: "green",
  },
];

const steps = [
  { icon: Github, title: "Connect a repository", description: "Bring a GitHub project or paste a public repository URL." },
  { icon: Activity, title: "We map your code", description: "SPARK reads structure, dependencies, tests, and code quality." },
  { icon: BarChart3, title: "Get the full picture", description: "Review a clear score and findings across four key dimensions." },
  { icon: Zap, title: "Make your next move", description: "Use focused AI recommendations to ship with confidence." },
];

const testimonials = [
  {
    quote: "We went from a vague sense of tech debt to a roadmap the whole team could get behind.",
    name: "Maya Chen",
    role: "Engineering Lead, Linear",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=112&h=112&q=85",
  },
  {
    quote: "The report feels like a senior engineer spent an afternoon with our codebase. It gets to the point.",
    name: "Jordan Rivera",
    role: "Founder, Buildspace",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=112&h=112&q=85",
  },
  {
    quote: "Our team uses SPARK before every handoff. It makes project readiness something we can actually measure.",
    name: "Amara Okafor",
    role: "Staff Engineer, Vercel",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=112&h=112&q=85",
  },
];

function ScoreRing({ score }: { score: number }) {
  return (
    <div className="score-ring score-ring-large" style={{ "--score": `${score * 3.6}deg` } as CSSProperties}>
      <div className="score-ring-center">
        <strong>{score}</strong>
        <span>/ 100</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="spark-page">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="SPARK AI home">
          <span className="brand-mark"><Sparkles size={17} strokeWidth={2.4} /></span>
          <span>SPARK<span className="brand-ai">AI</span></span>
        </a>
        <nav className={`main-nav ${mobileMenuOpen ? "main-nav-open" : ""}`} aria-label="Main navigation">
          <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <a href="#trusted" onClick={() => setMobileMenuOpen(false)}>About us</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>Docs</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button search-trigger" aria-label="Search this page" onClick={() => setSearchOpen(!searchOpen)}>
            {searchOpen ? <X size={19} /> : <Search size={19} />}
          </button>
          <Link className="button button-coral button-small header-cta" href="/analysis">Get started <ArrowUpRight size={15} /></Link>
          <button className="icon-button menu-trigger" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {searchOpen && (
          <form className="search-popover" action="#features" onSubmit={() => setSearchOpen(false)}>
            <Search size={17} />
            <input autoFocus aria-label="Search sections" placeholder="Search SPARK AI..." onKeyDown={(event) => {
              if (event.key === "Enter") setSearchOpen(false);
            }} />
            <span>↵</span>
          </form>
        )}
      </header>

      <section className="hero-section" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR CODE, READY FOR WHAT&apos;S NEXT</div>
          <h1>Analyze. Improve.<br />Build <span>industry-ready</span><br />projects.</h1>
          <p className="hero-description">The AI codebase analyst that turns your repository into a clear path forward. Know what&apos;s working, what needs attention, and what to do next.</p>
          <div className="hero-actions">
            <Link className="button button-coral" href="/analysis">Analyze your repository <ArrowRight size={17} /></Link>
            <a className="button button-outline" href="#how-it-works"><span className="play-icon">▶</span> View demo</a>
          </div>
          <div className="hero-note"><div className="avatar-stack"><span>J</span><span>M</span><span>A</span><span>+</span></div><p><strong>2,000+</strong> developers found their next step</p></div>
        </div>
        <div className="hero-visual" aria-label="SPARK AI repository analysis overview">
          <div className="hero-report-card">
            <div className="report-topline"><span>REPOSITORY ANALYSIS</span><span className="report-live"><i /> COMPLETE</span></div>
            <div className="hero-report-heading"><div><span className="tiny-label">PROJECT OVERVIEW</span><h2><Github size={17} /> acme / storefront</h2></div><span className="report-branch"><GitBranch size={13} /> main</span></div>
            <div className="hero-score-row"><ScoreRing score={84} /><div className="hero-score-copy"><span className="score-up"><ArrowUpRight size={14} /> +12 points</span><strong>Strong foundation</strong><p>Good to go, with a few clear opportunities to improve.</p></div></div>
            <div className="mini-metric-grid">
              <div><span className="mini-metric-icon coral-tint"><Code2 size={15} /></span><span>Code quality</span><b>91</b></div>
              <div><span className="mini-metric-icon blue-tint"><LockKeyhole size={15} /></span><span>Security</span><b>78</b></div>
              <div><span className="mini-metric-icon violet-tint"><CircleDot size={15} /></span><span>Testing</span><b>84</b></div>
              <div><span className="mini-metric-icon green-tint"><Activity size={15} /></span><span>Performance</span><b>82</b></div>
            </div>
            <div className="hero-report-footer"><span><span className="footer-green-dot" /> Analysis complete</span><span>248 files scanned</span></div>
          </div>
        </div>
      </section>

      <section className="features-section section-wrap" id="features">
        <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> POWERFUL FEATURES</div><h2>Everything you need to<br />ship better code.</h2></div><p>Clear, practical insight for every stage of your project.</p></div>
        <div className="feature-grid">
          {featureCards.map(({ icon: Icon, title, description, tone }, index) => (
            <article className={`feature-card feature-${tone}`} key={title}>
              <div className="feature-card-top"><span className="feature-icon"><Icon size={19} strokeWidth={1.8} /></span><span className="feature-number">0{index + 1}</span></div>
              <h3>{title}</h3><p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="steps-section" id="how-it-works">
        <div className="section-wrap steps-inner">
          <div className="steps-heading"><div className="eyebrow"><span className="eyebrow-dot" /> HOW IT WORKS</div><h2>From repository to readiness in <span>4 simple steps</span></h2><p>Connect your code, understand its health, and leave with a clear next step.</p></div>
          <div className="steps-grid">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <article className="step-card" key={title}><div className="step-top"><span className="step-icon"><Icon size={19} /></span><span className="step-number">0{index + 1}</span></div><h3>{title}</h3><p>{description}</p>{index < steps.length - 1 && <ArrowRight className="step-arrow" size={18} />}</article>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonials-section section-wrap" id="pricing">
        <div className="testimonials-header"><div><div className="eyebrow"><span className="eyebrow-dot" /> WORD ON THE BUILD</div><h2>Good company<br />ships better code.</h2></div><div className="rating-summary"><div className="star-row"><Star /><Star /><Star /><Star /><Star /></div><strong>4.9 / 5</strong><span>from teams who build</span></div></div>
        <div className="testimonial-grid">{testimonials.map((testimonial) => <article className="testimonial-card" key={testimonial.name}><div className="testimonial-stars"><Star /><Star /><Star /><Star /><Star /></div><blockquote>“{testimonial.quote}”</blockquote><div className="testimonial-person"><Image src={testimonial.image} alt="" width={48} height={48} unoptimized /><div><strong>{testimonial.name}</strong><span>{testimonial.role}</span></div><span className="quote-mark">“</span></div></article>)}</div>
      </section>

      <section className="final-cta section-wrap" id="final-cta">
        <div className="cta-pattern" aria-hidden="true"><span /><span /><span /><span /><span /></div>
        <div className="cta-content"><div className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> YOUR NEXT BUILD STARTS HERE</div><h2>Make your next<br />move a confident one.</h2><p>Bring your repository. Leave with a better plan.</p><Link className="button button-navy" href="/analysis">Analyze your repository <ArrowUpRight size={16} /></Link><span className="cta-note"><LockKeyhole size={12} /> Free to start. No credit card required.</span></div>
        <div className="cta-art"><div className="cta-art-ring ring-one" /><div className="cta-art-ring ring-two" /><div className="cta-art-center"><Sparkles size={33} /></div><span className="cta-art-tag">84 <small>HEALTH SCORE</small></span><span className="cta-art-check"><Check size={15} /></span></div>
      </section>

      <footer className="site-footer">
        <div className="footer-main section-wrap">
          <div className="footer-brand-column">
            <a className="brand footer-brand" href="#home"><span className="brand-mark"><Sparkles size={17} strokeWidth={2.4} /></span><span>SPARK<span className="brand-ai">AI</span></span></a>
            <p>Make better software,<br />one insight at a time.</p>
            <div className="social-links"><a href="https://github.com" aria-label="GitHub"><Github size={17} /></a><a href="https://www.linkedin.com" aria-label="LinkedIn"><span>in</span></a><a href="https://x.com" aria-label="X"><X size={17} /></a></div>
          </div>
          <div className="footer-column"><h3>Product</h3><a href="#features">Features</a><Link href="/analysis">Analysis report</Link><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a></div>
          <div className="footer-column"><h3>Resources</h3><a href="#how-it-works">Documentation</a><a href="#features">Guides</a><a href="#trusted">Changelog</a><a href="#pricing">Support</a></div>
          <div className="footer-column"><h3>Company</h3><a href="#home">About SPARK</a><a href="#pricing">Customers</a><a href="#home">Careers</a><a href="#home">Contact</a></div>
          <div className="footer-newsletter"><span>THE OCCASIONAL GOOD IDEA</span><h3>Build a little<br />better, every week.</h3><a href="#home">Get the SPARK notes <ArrowUpRight size={15} /></a></div>
        </div>
        <div className="footer-bottom section-wrap"><span>© 2025 SPARK AI, Inc.</span><div><a href="#home">Privacy</a><a href="#home">Terms</a><a href="#home">Status <i className="footer-status-dot" /></a></div><span>Made for the makers. <Sparkles size={13} /></span></div>
      </footer>
    </main>
  );
}
