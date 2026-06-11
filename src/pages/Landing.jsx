import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
            ...e.target.parentElement.querySelectorAll(".lp-reveal:not(.lp-visible)"),
            ];
            const idx = siblings.indexOf(e.target);
            setTimeout(
            () => e.target.classList.add("lp-visible"),
              Math.min(idx * 70, 280)
            );
            obs.unobserve(e.target);
        }
        });
    },
    { threshold: 0.1 }
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
const WORDS = ["real growth", "lasting change", "better days", "your best self", "daily wins"];
function useTypewriter(words, speed = 80, pause = 1800) {
const [display, setDisplay] = useState("");
const [wordIdx, setWordIdx] = useState(0);
const [charIdx, setCharIdx] = useState(0);
const [deleting, setDeleting] = useState(false);

useEffect(() => {
    const current = words[wordIdx];
    let timeout;
    if (!deleting && charIdx < current.length) {
    timeout = setTimeout(() => setCharIdx(c => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
    timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
    timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
    setDeleting(false);
    setWordIdx(i => (i + 1) % words.length);
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
        <div className="lp-hero-kicker">
            <span className="lp-hero-kicker-dot">🌱</span>
            Wecamp Batch 11 · Capstone Project
        </div>

          {/* headline with typewriter */}
        <h1 className="lp-hero-h1">
            Small habits,
            <span className="lp-hero-h1-line2">
            <span className="lp-typeword">
                {word}
                <span style={{
                display:"inline-block", width:"2px", height:"0.85em",
                background:"#b94d8e", marginLeft:"2px",
                verticalAlign:"middle",
                animation:"lp-cursor 0.9s step-end infinite"
                }}/>
            </span>
            </span>
        </h1>
        <style>{`
            @keyframes lp-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
        `}</style>

          {/* sub */}
        <p className="lp-hero-sub">
            Track what you do every day. Set streaks, hit goals, see patterns.
            HabitBloom keeps it simple so you actually stick with it.
        </p>

          {/* CTA buttons */}
        <div className="lp-hero-actions">
            <button className="lp-cta-primary" onClick={() => navigate("/signup")}>
            Start building habits
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            </button>
            <button className="lp-cta-secondary" onClick={() => navigate("/signin")}>
            Already have an account? Log in →
            </button>
        </div>

          {/* social proof */}
        <div className="lp-hero-proof">
            <div className="lp-proof-avatars">
            {["M","L","A","K"].map((l, i) => (
                <div key={i} className={`lp-proof-avatar pa${i+1}`}>{l}</div>
            ))}
            </div>
            <p className="lp-proof-text">
            Built by <strong>Team 4</strong> · Wecamp Batch 11
            </p>
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
                    <circle cx="26" cy="26" r="20" fill="none" stroke="#f0f0f0" strokeWidth="5" />
                    <circle cx="26" cy="26" r="20" fill="none" stroke="#F9B2D7" strokeWidth="5"
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
                { cls:"lphr-pink",   icls:"lp-hi-pink",   icon:"💧", name:"Drink Water",  meta:"6 of 8 · Health",      chk:"lp-hc-prog", lbl:"~" },
                { cls:"lphr-blue",   icls:"lp-hi-blue",   icon:"📚", name:"Read 30 mins", meta:"Done · Study",         chk:"lp-hc-done", lbl:"✓" },
                { cls:"lphr-green",  icls:"lp-hi-green",  icon:"🧘", name:"Meditate",     meta:"Not started · Mind",   chk:"lp-hc-none", lbl:"!" },
                { cls:"lphr-yellow", icls:"lp-hi-yellow", icon:"🏃", name:"Morning Run",  meta:"Done · Health",        chk:"lp-hc-done", lbl:"✓" },
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