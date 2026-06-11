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