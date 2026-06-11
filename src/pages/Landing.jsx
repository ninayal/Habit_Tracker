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