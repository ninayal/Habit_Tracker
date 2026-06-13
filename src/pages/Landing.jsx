import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStepTypewriter } from "../hooks/useStepTypewriter";
import "./styles/Landing.css";

/* scroll position */
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const handler = () => setY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return y;
}

/* intersection reveal*/
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".lp-reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const siblings = [
              ...e.target.parentElement.querySelectorAll(
                ".lp-reveal:not(.lp-visible)",
              ),
            ];
            const idx = siblings.indexOf(e.target);
            setTimeout(
              () => e.target.classList.add("lp-visible"),
              Math.min(idx * 70, 280),
            );
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* FAQ item */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`lp-faq-item${open ? " open" : ""}`}>
      <div className="lp-faq-q" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <button className="lp-faq-toggle" aria-label="toggle">
          {open ? "−" : "+"}
        </button>
      </div>
      <div className="lp-faq-a">{a}</div>
    </div>
  );
}

/* Running banner */
const WORDS = [
  "real growth",
  "lasting change",
  "better days",
  "your best self",
  "daily wins",
];
function useTypewriter(words, speed = 80, pause = 1800) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    let timeout;
    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setWordIdx((i) => (i + 1) % words.length);
    }
    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return display;
}

/* ─── HERO SECTION ─── */
function HeroSection({ navigate }) {
  const word = useTypewriter(WORDS);
  return (
    <section className="lp-hero" id="home">
      {/* animated background */}
      <div className="lp-orb lp-orb-1" />
      <div className="lp-orb lp-orb-2" />
      <div className="lp-orb lp-orb-3" />
      <div className="lp-hero-inner">
        {/* kicker pill */}

        {/* headline with typewriter */}
        <h1 className="lp-hero-h1">
          Small habits,
          <span className="lp-hero-h1-line2">
            <span className="lp-typeword">
              {word}
              <span
                style={{
                  display: "inline-block",
                  width: "2px",
                  height: "0.85em",
                  background: "#b94d8e",
                  marginLeft: "2px",
                  verticalAlign: "middle",
                  animation: "lp-cursor 0.9s step-end infinite",
                }}
              />
            </span>
          </span>
        </h1>
        <style>{`
            @keyframes lp-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
        `}</style>

        {/* sub */}
        <p className="lp-hero-sub">
          Track what you do every day. Set streaks, hit goals, see patterns.
          1Percent keeps it simple so you actually stick with it.
        </p>

        {/* CTA buttons */}
        <div className="lp-hero-actions">
          <button
            className="lp-cta-primary"
            onClick={() => navigate("/signup")}
          >
            Start building habits
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button
            className="lp-cta-secondary"
            onClick={() => navigate("/signin")}
          >
            Already have an account? Log in →
          </button>
        </div>

        {/* scattered cards + central mockup */}
        <div className="lp-hero-cards">
          {/* floating mini cards */}
          <div className="lp-mini-card lp-mc-streak">
            <span className="lp-mini-card-icon">🔥</span>
            <div>
              <div>14-day streak</div>
              <div className="lp-mini-card-label">Keep it up!</div>
            </div>
          </div>

          <div className="lp-mini-card lp-mc-goal">
            <span className="lp-mini-card-icon">🎯</span>
            <div>
              <div>80% to goal</div>
              <div className="lp-mini-card-label">30-day streak target</div>
            </div>
          </div>

          <div className="lp-mini-card lp-mc-done">
            <span className="lp-mini-card-icon">✅</span>
            <div>
              <div>3 of 4 done</div>
              <div className="lp-mini-card-label">Today's habits</div>
            </div>
          </div>

          <div className="lp-mini-card lp-mc-rate">
            <span className="lp-mini-card-icon">📊</span>
            <div>
              <div>92% rate</div>
              <div className="lp-mini-card-label">Last 7 days</div>
            </div>
          </div>

          {/* central app mockup */}
          <div className="lp-mockup">
            <div className="lp-streak-badge">🔥 14-day streak!</div>

            <div className="lp-mockup-topbar">
              <div>
                <div className="lp-mockup-greeting">Thu, June 11</div>
                <div className="lp-mockup-title">Today's habits</div>
              </div>
              <div className="lp-mockup-ring">
                <svg width="52" height="52" viewBox="0 0 52 52">
                  <circle
                    cx="26"
                    cy="26"
                    r="20"
                    fill="none"
                    stroke="#f0f0f0"
                    strokeWidth="5"
                  />
                  <circle
                    cx="26"
                    cy="26"
                    r="20"
                    fill="none"
                    stroke="#F9B2D7"
                    strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * 0.25}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="lp-mockup-ring-label">
                  <span className="lp-mockup-ring-pct">75%</span>
                  <span className="lp-mockup-ring-sub">done</span>
                </div>
              </div>
            </div>

            <div className="lp-habits">
              {[
                {
                  cls: "lphr-pink",
                  icls: "lp-hi-pink",
                  icon: "💧",
                  name: "Drink Water",
                  meta: "6 of 8 · Health",
                  chk: "lp-hc-prog",
                  lbl: "~",
                },
                {
                  cls: "lphr-blue",
                  icls: "lp-hi-blue",
                  icon: "📚",
                  name: "Read 30 mins",
                  meta: "Done · Study",
                  chk: "lp-hc-done",
                  lbl: "✓",
                },
                {
                  cls: "lphr-green",
                  icls: "lp-hi-green",
                  icon: "🧘",
                  name: "Meditate",
                  meta: "Not started · Mind",
                  chk: "lp-hc-none",
                  lbl: "!",
                },
                {
                  cls: "lphr-yellow",
                  icls: "lp-hi-yellow",
                  icon: "🏃",
                  name: "Morning Run",
                  meta: "Done · Health",
                  chk: "lp-hc-done",
                  lbl: "✓",
                },
              ].map((h, i) => (
                <div key={i} className={`lp-habit-row ${h.cls}`}>
                  <div className={`lp-habit-icon ${h.icls}`}>{h.icon}</div>
                  <div className="lp-habit-info">
                    <div className="lp-habit-name">{h.name}</div>
                    <div className="lp-habit-meta">{h.meta}</div>
                  </div>
                  <div className={`lp-habit-check ${h.chk}`}>{h.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── TICKER data ─── */
const TICKER_ITEMS = [
  "Habit Tracking",
  "Daily Check-ins",
  "Streak Counter",
  "Goal Setting",
  "Stats Dashboard",
  "5 Categories",
  "Smart Filters",
  "Undo Actions",
  "Progress Rings",
];

/* ─── REVIEWS data ─── */
const REVIEWS = [
  {
    av: "rv1",
    init: "M",
    name: "Minh Trần",
    role: "Developer",
    q: "I've tried every habit app. 1Percent is the first one that made me open it every single morning without being reminded.",
  },
  {
    av: "rv2",
    init: "L",
    name: "Linh Nguyễn",
    role: "Designer",
    q: "The streak counter is brutal in the best way. 45 days and I still refuse to break it.",
  },
  {
    av: "rv3",
    init: "A",
    name: "An Phạm",
    role: "Student",
    q: "Setting daily targets instead of just 'did it / didn't' changed how I think about habits completely.",
  },
  {
    av: "rv4",
    init: "K",
    name: "Khánh Lê",
    role: "Product Manager",
    q: "I screenshot my weekly stats and send them to friends. The dashboard is genuinely that satisfying.",
  },
  {
    av: "rv5",
    init: "T",
    name: "Thu Hoàng",
    role: "Freelancer",
    q: "Missed habits are highlighted without being preachy. It shows the gap. You decide what to do with it.",
  },
  {
    av: "rv6",
    init: "D",
    name: "Đức Bùi",
    role: "Teacher",
    q: "'80% to your streak goal' at the right moment is pure magic. I've never felt more motivated.",
  },
];

/* ─── FAQ data ─── */
const FAQS = [
  {
    q: "Does my data survive a page refresh?",
    a: "Yes. All habits, check-ins, goals, and streak state are stored in localStorage and persist across refreshes and browser restarts.",
  },
  {
    q: "What counts as a completed habit?",
    a: "A habit is 'Completed' when your logged count hits the daily target you set. Anything in between is 'In Progress'. Zero is 'Not Started'.",
  },
  {
    q: "Can I check in for past or future dates?",
    a: "Check-ins are locked to today. Future dates are blocked to keep streaks honest. Past edits are only allowed for the current day.",
  },
  {
    q: "What happens when I hit 80% of a goal?",
    a: "You see an encouragement nudge. At 100% you get a goal-achieved alert and the option to set a new target.",
  },
  {
    q: "Can I pause a habit without losing my streak?",
    a: "Yes. Paused habits are excluded from daily views and missed-check-in highlights. Resume any time to pick up where you left off.",
  },
  {
    q: "What does 'at risk' mean on the dashboard?",
    a: "Any active habit with no check-in yet today is flagged as 'at risk of breaking a streak' — giving you a nudge before the day ends.",
  },
];

/* ─── HOW STEPS ─── */
function HowSteps() {
  const { text, activeIdx } = useStepTypewriter();
  return (
    <div className="lp-how-grid">
      {/* Step 1 */}
      <div className="lp-step lp-step-s1 lp-reveal">
        <div className="lp-step-pill lp-step-pill-1">🌱 New habit!</div>
        <div className="lp-step-inner">
          <span className="lp-step-tag">Step 01</span>
          <span className="lp-step-num-bg">1</span>
          <div className="lp-step-title">Add a Habit</div>
          <div className="lp-step-desc">
            Name it, pick a category, set frequency and daily target.
          </div>
          <div className="lp-sv1-box">
            <span>
              {text}
              <span className="lp-sv1-cursor" />
            </span>
          </div>
          <div className="lp-sv1-cats">
            {["Health", "Study", "Work", "Mind"].map((c, i) => (
              <span
                key={i}
                className={`lp-sv1-cat${i === activeIdx ? " lit" : ""}`}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* Step 2 */}
      <div className="lp-step lp-step-s2 lp-reveal">
        <div className="lp-step-inner">
          <span className="lp-step-tag">Step 02</span>
          <span className="lp-step-num-bg">2</span>
          <div className="lp-step-title">Set a Goal</div>
          <div className="lp-step-desc">
            Streak or total completions. Tracked automatically.
          </div>
          <div className="lp-sv2-wrap">
            <div className="lp-sv2-ring">
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="24"
                  fill="none"
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="5"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="24"
                  fill="none"
                  stroke="#b94d8e"
                  strokeWidth="5"
                  className="lp-sv2-fill"
                  strokeLinecap="round"
                />
              </svg>
              <div className="lp-sv2-label">
                <span className="lp-sv2-pct">80%</span>
                <span className="lp-sv2-sub">done</span>
              </div>
            </div>
            <div className="lp-sv2-text">
              <strong>6 days</strong> left to hit your 30-day streak!
            </div>
          </div>
        </div>
      </div>
      {/* Step 3 */}
      <div className="lp-step lp-step-s3 lp-reveal">
        <div className="lp-step-pill lp-step-pill-2">3 done today</div>
        <div className="lp-step-inner">
          <span className="lp-step-tag">Step 03</span>
          <span className="lp-step-num-bg">3</span>
          <div className="lp-step-title">Check In Daily</div>
          <div className="lp-step-desc">
            Log progress, adjust counts — under 30 seconds.
          </div>
          <div>
            {[
              {
                cls: "lp-vd-done",
                lbl: "✓",
                name: "Morning run",
                w: "100%",
                bg: "#4ab86b",
              },
              {
                cls: "lp-vd-prog",
                lbl: "~",
                name: "Drink water",
                w: "62%",
                bg: "#f59e0b",
              },
              {
                cls: "lp-vd-none",
                lbl: "!",
                name: "Meditate",
                w: "0%",
                bg: "#d1d5db",
              },
            ].map((r, i) => (
              <div key={i} className="lp-sv3-row">
                <span className={`lp-sv3-dot ${r.cls}`}>{r.lbl}</span>
                <span style={{ flex: 1 }}>{r.name}</span>
                <div className="lp-sv3-bar">
                  <div
                    className="lp-sv3-fill"
                    style={{ width: r.w, background: r.bg }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Step 4 */}
      <div className="lp-step lp-step-s4 lp-reveal">
        <div className="lp-step-inner">
          <span className="lp-step-tag">Step 04</span>
          <span className="lp-step-num-bg">4</span>
          <div className="lp-step-title">Watch It Grow</div>
          <div className="lp-step-desc">
            Streaks, rates, and goal progress update live.
          </div>
          <div>
            {[
              { label: "🔥 Streak", val: "14 days" },
              { label: "📊 7-day rate", val: "92%" },
              { label: "✅ Total done", val: "198" },
            ].map((s, i) => (
              <div key={i} className="lp-sv4-row">
                <span>{s.label}</span>
                <span className="lp-sv4-val">{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
    MAIN COMPONENT
  ══════════════════════════════════════════════════════════ */

export default function Landing() {
  const navigate = useNavigate();
  const scrollY = useScrollY();
  useReveal();

  // duplicate ticker for seamless loop
  const tickerItems = [...TICKER_ITEMS, ...TICKER_ITEMS];
  const reviewItems = [...REVIEWS, ...REVIEWS];
  return (
    <div className="lp">
      {/* ── NAVIGATION BAR */}
      <nav className={`lp-nav${scrollY > 20 ? " scrolled" : ""}`}>
        <a href="#" className="lp-nav-logo">
          <span>1Percent</span>
          <span className="lp-nav-logo-dot" />
        </a>

        <ul className="lp-nav-links">
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#how">How it works</a>
          </li>
          <li>
            <a href="#categories">Categories</a>
          </li>
          <li>
            <a href="#reviews">Reviews</a>
          </li>
        </ul>

        <div className="lp-nav-auth">
          <button className="lp-btn-ghost" onClick={() => navigate("/signin")}>
            Log in
          </button>
          <button className="lp-btn-solid" onClick={() => navigate("/signup")}>
            Sign up free
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <HeroSection navigate={navigate} />

      {/* ── TICKER ───────────────────────────────── */}
      <div className="lp-ticker">
        <div className="lp-ticker-track">
          {tickerItems.map((item, i) => (
            <span key={i} className="lp-ticker-item">
              {item}
              <span className="lp-ticker-sep">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ──────────────────────────────── */}
      <section className="lp-section lp-features" id="features">
        <div className="lp-section-inner">
          <div className="lp-features-header">
            <div>
              <span className="lp-section-label lp-reveal">
                Everything you need
              </span>
              <h2 className="lp-section-h2 lp-reveal">
                Built for real life,
                <br />
                <em>not perfection</em>
              </h2>
            </div>
            <p className="lp-section-sub lp-reveal">
              Every feature reduces friction. Even on off days, 1Percent keeps
              you moving.
            </p>
          </div>

          <div className="lp-features-grid">
            {/* HERO: Habit Management */}
            <div className="lp-feat-card lp-fc-hero lp-reveal">
              <div>
                <div className="lp-feat-hero-num">01</div>
                <div className="lp-feat-hero-title">
                  Habit
                  <br />
                  Management
                </div>
                <div className="lp-feat-hero-body">
                  Create, edit, pause, and archive habits. Set categories,
                  frequency, daily targets, and priority levels that fit your
                  real life.
                </div>
                <div className="lp-feat-hero-tags">
                  <span className="lp-feat-hero-tag">Add / Edit</span>
                  <span className="lp-feat-hero-tag">Pause & Resume</span>
                  <span className="lp-feat-hero-tag">Archive</span>
                  <span className="lp-feat-hero-tag">Priority</span>
                  <span className="lp-feat-hero-tag">Frequency</span>
                </div>
              </div>
            </div>
            {/* Daily Check-ins */}
            <div className="lp-feat-card lp-fc-checkin lp-reveal">
              <div className="lp-feat-num">02</div>
              <div className="lp-feat-title">Daily Check-ins</div>
              <p className="lp-feat-desc">
                Log progress each day. Mark habits done, adjust counts, and view
                history grouped by date.
              </p>
            </div>

            {/* Goals */}
            <div className="lp-feat-card lp-fc-goals lp-reveal">
              <div className="lp-feat-num">03</div>
              <div className="lp-feat-title">Goals & Milestones</div>
              <p className="lp-feat-desc">
                Set streak or total-completion targets.
              </p>
              <div className="lp-feat-goal-bar">
                <div className="lp-feat-goal-bar-label">
                  <span>30-day streak</span>
                  <span>80%</span>
                </div>
                <div className="lp-feat-goal-track">
                  <div className="lp-feat-goal-fill" />
                </div>
                <span className="lp-feat-goal-nudge">
                  🎉 Almost there, keep going!
                </span>
              </div>
            </div>
            {/* Stats */}
            <div className="lp-feat-card lp-fc-stats lp-reveal">
              <div className="lp-feat-num">04</div>
              <div className="lp-feat-title">Stats Dashboard</div>
              <p className="lp-feat-desc">
                Streaks, completion rate, totals — all in one view.
              </p>
              <div className="lp-feat-stat-pills">
                <div className="lp-feat-stat-pill">
                  <span>🔥 Current streak</span>
                  <span className="lp-feat-stat-val">14 days</span>
                </div>
                <div className="lp-feat-stat-pill">
                  <span>📊 7-day rate</span>
                  <span className="lp-feat-stat-val">92%</span>
                </div>
              </div>
            </div>
            {/* Filter */}
            <div className="lp-feat-card lp-fc-filter lp-reveal">
              <div className="lp-feat-num">05</div>
              <div className="lp-feat-title">Smart Filtering</div>
              <p className="lp-feat-desc">
                Filter by category, frequency, priority, or status. Find exactly
                what you need instantly.
              </p>
            </div>
            {/* Undo full width */}
            <div className="lp-feat-card lp-fc-undo lp-reveal">
              <div className="lp-fc-undo-left">
                <div className="lp-fc-undo-icon">↩️</div>
                <div>
                  <div className="lp-fc-undo-title">Undo & Reset</div>
                  <div className="lp-fc-undo-body">
                    Made a mistake? Undo your last check-in or reset to initial
                    state. Your progress is always recoverable.
                  </div>
                </div>
              </div>
              <div className="lp-fc-undo-badge">Safety net included</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-section lp-how" id="how">
        <div className="lp-section-inner">
          <span className="lp-section-label lp-reveal">Simple by design</span>

          <h2 className="lp-section-h2 lp-reveal">
            From zero to habit hero
            <br />
            <em>in 4 steps</em>
          </h2>
          <HowSteps />
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="lp-section lp-cats" id="categories">
        <div className="lp-section-inner">
          <span className="lp-section-label lp-reveal">Five life areas</span>
          <h2 className="lp-section-h2 lp-reveal">
            Every part of your day,
            <br />
            <em>covered</em>
          </h2>

          <div className="lp-cats-grid">
            {/* HERO: Health */}
            <div className="lp-cat-hero lp-reveal">
              <div>
                <div className="lp-cat-hero-tag">Category · Health</div>
                <div className="lp-cat-hero-title">
                  Your body,
                  <br />
                  your foundation
                </div>
                <div className="lp-cat-hero-body">
                  Hydration, exercise, sleep — the habits that fuel everything
                  else you do.
                </div>
                <div className="lp-cat-hero-examples">
                  <span className="lp-cat-hero-ex">Drink water</span>
                  <span className="lp-cat-hero-ex">Morning run</span>
                  <span className="lp-cat-hero-ex">Sleep 8hrs</span>
                  <span className="lp-cat-hero-ex">Vitamins</span>
                </div>
              </div>
            </div>

            {/* Study */}
            <div className="lp-cat-card lp-cc-study lp-reveal">
              <div className="lp-cat-tag">Category · Study</div>
              <div className="lp-cat-title">Study</div>
              <div className="lp-cat-body">
                Daily reading, language learning, courses. Build the habit that
                compounds.
              </div>
            </div>

            {/* Work */}
            <div className="lp-cat-card lp-cc-work lp-reveal">
              <div className="lp-cat-tag">Category · Work</div>
              <div className="lp-cat-title">Work</div>
              <div className="lp-cat-body">
                Deep work and routines that make you genuinely more effective
                every day.
              </div>
            </div>

            {/* Mindfulness */}
            <div className="lp-cat-card lp-cc-mind lp-reveal">
              <div className="lp-cat-tag">Category · Mindfulness</div>
              <div className="lp-cat-title">Mindfulness</div>
              <div className="lp-cat-body">
                Meditation, journaling, gratitude — small moments of calm that
                add up.
              </div>
            </div>

            {/* Other */}
            <div className="lp-cat-card lp-cc-other lp-reveal">
              <div className="lp-cat-tag">Flexible · Other</div>
              <div className="lp-cat-title">Your unique habits</div>
              <div className="lp-cat-body">
                Not everything fits a box. Set priority and track it anyway.
              </div>
              <div className="lp-priority-row">
                <span className="lp-pill lp-pill-h">High</span>
                <span className="lp-pill lp-pill-m">Medium</span>
                <span className="lp-pill lp-pill-l">Low</span>
              </div>
            </div>

            {/* Streak banner */}
            <div className="lp-cat-streak lp-reveal">
              <div className="lp-cat-streak-left">
                <span className="lp-cat-streak-icon">🔥</span>
                <div>
                  <div className="lp-cat-streak-title">
                    Missed habits are highlighted
                  </div>
                  <div className="lp-cat-streak-body">
                    Any active habit without a check-in today is flagged. No
                    streak dies silently.
                  </div>
                </div>
              </div>
              <div className="lp-cat-streak-badge">Streak protection</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ───────────────────────────────────── */}
      <section className="lp-section lp-reviews" id="reviews">
        <div className="lp-section-inner">
          <div className="lp-reviews-header">
            <div>
              <span className="lp-section-label lp-reveal">
                Loved by habit builders
              </span>
              <h2 className="lp-section-h2 lp-reveal">
                Real people,
                <br />
                <em>real streaks</em>
              </h2>
            </div>
            <p className="lp-reviews-hint lp-reveal">Hover to pause and read</p>
          </div>
        </div>
        <div className="lp-review-track-wrap">
          <div className="lp-review-track">
            {reviewItems.map((r, i) => (
              <div key={i} className="lp-review-card">
                <div className="lp-review-stars">★★★★★</div>
                <p className="lp-review-q">"{r.q}"</p>
                <div className="lp-review-author">
                  <div className={`lp-review-av ${r.av}`}>{r.init}</div>
                  <div>
                    <div className="lp-review-name">{r.name}</div>
                    <div className="lp-review-role">{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NUMBERS STRIP ─────────────────────────────── */}
      <div className="lp-numbers">
        <div className="lp-numbers-grid">
          {[
            { val: "5", label: "Habit categories" },
            { val: "∞", label: "Streaks possible" },
            { val: "100%", label: "Runs on localStorage" },
            { val: "0", label: "Backend needed" },
          ].map((n, i) => (
            <div key={i} className="lp-reveal">
              <div className="lp-num-val">{n.val}</div>
              <div className="lp-num-label">{n.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ────── */}
      <section className="lp-section lp-faq" id="faq">
        <div className="lp-section-inner">
          <span className="lp-section-label lp-reveal">Questions answered</span>
          <h2 className="lp-section-h2 lp-reveal">
            Things people
            <br />
            <em>always ask</em>
          </h2>
          <div className="lp-faq-grid">
            {FAQS.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────── */}
      <section className="lp-cta-section">
        <div className="lp-cta-deco lp-cta-deco-1">🌸</div>
        <div className="lp-cta-deco lp-cta-deco-2">✨</div>
        <div className="lp-cta-inner">
          <span className="lp-section-label lp-reveal">It starts today</span>
          <h2 className="lp-section-h2 lp-reveal">
            One habit. One day.
            <br />
            <em>One streak.</em>
          </h2>
          <p className="lp-section-sub lp-reveal">
            The hardest part is starting. 1Percent handles everything after
            that.
          </p>
          <button
            className="lp-cta-bigbtn lp-reveal"
            onClick={() => navigate("/signup")}
          >
            🌱 Start building habits — it's free
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-grid">
          <div className="lp-footer-brand">
            <span className="lp-footer-brand-logo">
              1<span>Percent</span>
            </span>
            <p>1% better. Every single day.</p>
          </div>
          <div className="lp-footer-col">
            <h5>Product</h5>
            <ul>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#how">How it works</a>
              </li>
              <li>
                <a href="#categories">Categories</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
          </div>
          <div className="lp-footer-col">
            <h5>Get started</h5>
            <ul>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/signup");
                  }}
                >
                  Sign up free
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/signin");
                  }}
                >
                  Log in
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/dashboard");
                  }}
                >
                  Dashboard
                </a>
              </li>
            </ul>
          </div>
          <div className="lp-footer-col">
            <h5>Project</h5>
            <ul>
              <li>
                <a
                  href="https://github.com/ninayal/Habit_Tracker-Capstone_Project"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub repo
                </a>
              </li>
              <li>
                <a href="#">README</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <p>© 2026 1Percent</p>
          <a
            href="https://github.com/ninayal/Habit_Tracker-Capstone_Project"
            target="_blank"
            rel="noreferrer"
            className="lp-footer-gh"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.58v-2.17c-3.34.72-4.04-1.61-4.04-1.61-.55-1.38-1.34-1.75-1.34-1.75-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.48 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
