"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMISATION VARIABLES — tweak these to adjust the navbar appearance
// ─────────────────────────────────────────────────────────────────────────────

const NAV = {
  // ── Heights ──────────────────────────────────────────────────────────────
  heightDefault:  "80px",   // full-width bar height
  heightScrolled: "58px",   // floating pill height  ← change this to adjust vertical size when scrolled

  // ── Width caps ───────────────────────────────────────────────────────────
  maxWidthDefault:  "1400px",
  maxWidthScrolled: "1120px",

  // ── Inset from screen edges when floating ────────────────────────────────
  insetScrolled: "1rem",    // top / left / right offset when pill is active

  // ── Background colour ────────────────────────────────────────────────────
  //    Format: rgba(R, G, B, ALPHA)
  //    • Alpha 0 = fully transparent, 1 = fully opaque
  //    • To use a different colour change R/G/B (0,0,0 = black)
  bgDefault:  "transparent",
  bgScrolled: "rgba(0, 0, 0, 0.55)",   // ← change alpha (0.45) for more/less dark

  // ── Blur ─────────────────────────────────────────────────────────────────
  blurDefault:  "blur(0px)",
  blurScrolled: "blur(20px)",

  // ── Border ───────────────────────────────────────────────────────────────
  //    rgba(255,255,255,ALPHA) = white border with given opacity
  borderDefault:  "rgba(255,255,255,0)",
  borderScrolled: "rgba(255,255,255,0.12)",  // ← change alpha for more/less visible border

  // ── Shadow ───────────────────────────────────────────────────────────────
  shadowScrolled: "0 20px 40px -12px rgba(0,0,0,0.25)",

  // ── Border radius ────────────────────────────────────────────────────────
  radiusScrolled: "1rem",   // pill corner radius when floating

  // ── Animation speed ──────────────────────────────────────────────────────
  duration: "550ms",
} as const;

const CONTENT = {
  // ── Logo ─────────────────────────────────────────────────────────────────
  logoSizeDefault:  "1.5rem",   // font-size when full-width
  logoSizeScrolled: "1.25rem",  // font-size when floating  ← smaller on scroll

  // ── Nav pills (Learn, FAQ) ────────────────────────────────────────────────
  pillFontDefault:  14,   // px
  pillFontScrolled: 12,   // px  ← smaller on scroll
  pillPaddingDefault:  "0.5rem 1rem",
  pillPaddingScrolled: "0.35rem 0.75rem",

  // ── CTA button (Get Started) ──────────────────────────────────────────────
  ctaHeightDefault:  40,   // px
  ctaHeightScrolled: 32,   // px  ← shorter on scroll
  ctaWidthDefault:   120,  // px
  ctaWidthScrolled:  108,  // px
  ctaFontDefault:    14,   // px
  ctaFontScrolled:   12,   // px  ← smaller font on scroll
} as const;

// ─────────────────────────────────────────────────────────────────────────────

function getScrollTop(): number {
  return (
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const loginMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(getScrollTop() > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });
    document.body.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!isLoginMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!loginMenuRef.current?.contains(event.target as Node)) {
        setIsLoginMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isLoginMenuOpen]);
  const scrollToFAQ = () => {
    document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const ease = `${NAV.duration} ease`;
  const transition = [
    `top ${ease}`, `left ${ease}`, `right ${ease}`,
    `height ${ease}`, `max-width ${ease}`, `border-radius ${ease}`,
    `background-color ${ease}`, `border-color ${ease}`,
    `box-shadow ${ease}`, `backdrop-filter ${ease}`,
  ].join(", ");

  return (
    <header
      style={{
        position: "fixed",
        zIndex: 50,
        top:   isScrolled ? NAV.insetScrolled : "0px",
        left:  isScrolled ? NAV.insetScrolled : "0px",
        right: isScrolled ? NAV.insetScrolled : "0px",
        transition: `top ${ease}, left ${ease}, right ${ease}`,
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "0 auto",
          padding: "0 2rem",
          userSelect: "none",
          height:    isScrolled ? NAV.heightScrolled  : NAV.heightDefault,
          maxWidth:  isScrolled ? NAV.maxWidthScrolled : NAV.maxWidthDefault,
          borderRadius:     isScrolled ? NAV.radiusScrolled : "0px",
          backgroundColor:  isScrolled ? NAV.bgScrolled     : NAV.bgDefault,
          backdropFilter:   isScrolled ? NAV.blurScrolled   : NAV.blurDefault,
          WebkitBackdropFilter: isScrolled ? NAV.blurScrolled : NAV.blurDefault,
          border: `1px solid ${isScrolled ? NAV.borderScrolled : NAV.borderDefault}`,
          boxShadow: isScrolled ? NAV.shadowScrolled : "none",
          transition,
        }}
      >
        {/* Logo — shrinks on scroll */}
        <Link
          href="/"
          style={{
            fontSize:       isScrolled ? CONTENT.logoSizeScrolled : CONTENT.logoSizeDefault,
            fontWeight:     700,
            color:          "white",
            textDecoration: "none",
            transition:     `font-size ${ease}`,
          }}
          draggable={false}
        >
          Crucible
        </Link>

        {/* Nav items */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <Link href="/waitlist" style={{ textDecoration: "none" }}>
            <NavPill label="Learn" isScrolled={isScrolled} />
          </Link>

          <NavPill label="FAQ" isScrolled={isScrolled} onClick={scrollToFAQ} />

          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <Link href="/gateway" draggable={false} style={{ textDecoration: "none" }}>
              <motion.button
                style={{
                  position:   "relative",
                  display:    "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  // height/width/font shrink on scroll
                  height:     isScrolled ? CONTENT.ctaHeightScrolled : CONTENT.ctaHeightDefault,
                  width:      isScrolled ? CONTENT.ctaWidthScrolled  : CONTENT.ctaWidthDefault,
                  fontSize:   isScrolled ? CONTENT.ctaFontScrolled   : CONTENT.ctaFontDefault,
                  borderRadius:    9999,
                  backgroundColor: "black",
                  overflow:   "hidden",
                  fontFamily: "Manrope, sans-serif",
                  fontWeight: 600,
                  letterSpacing: "-0.028em",
                  lineHeight: "1",
                  color:      "white",
                  border:     "none",
                  cursor:     "pointer",
                  transition: `height ${ease}, width ${ease}, font-size ${ease}`,
                }}
                draggable={false}
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                <motion.div
                  style={{ position: "absolute", inset: 0, borderRadius: 9999, backgroundColor: "white" }}
                  variants={{ rest: { scaleX: 0, originX: 0 }, hover: { scaleX: 1, originX: 0 } }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
                <motion.span
                  style={{ position: "relative", zIndex: 10 }}
                  variants={{ rest: { color: "#ffffff" }, hover: { color: "#000000" } }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  Get Started
                </motion.span>
              </motion.button>
            </Link>

            <div ref={loginMenuRef} style={{ position: "relative", zIndex: 60 }}>
              <motion.button
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: isScrolled ? CONTENT.ctaHeightScrolled : CONTENT.ctaHeightDefault,
                  width: isScrolled ? CONTENT.ctaHeightScrolled : CONTENT.ctaHeightDefault,
                  borderRadius: 9999,
                  backgroundColor: "rgba(0, 0, 0, 0.72)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  color: "white",
                  cursor: "pointer",
                  overflow: "hidden",
                  transition: `height ${ease}, width ${ease}, background-color 180ms ease, border-color 180ms ease`,
                }}
                type="button"
                aria-label="Open sign in options"
                aria-expanded={isLoginMenuOpen}
                aria-haspopup="menu"
                onClick={() => setIsLoginMenuOpen((open) => !open)}
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                <motion.div
                  style={{ position: "absolute", inset: 0, borderRadius: 9999, backgroundColor: "white" }}
                  variants={{ rest: { scale: 0, opacity: 0 }, hover: { scale: 1, opacity: 1 } }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                />
                <motion.svg
                  style={{ position: "absolute", zIndex: 10, width: isScrolled ? 14 : 16, height: isScrolled ? 14 : 16 }}
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  variants={{ rest: { opacity: 1, y: 0, color: "#ffffff" }, hover: { opacity: 0, y: -6, color: "#000000" } }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <path d="M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
                <motion.svg
                  style={{ position: "absolute", zIndex: 10, width: isScrolled ? 13 : 15, height: isScrolled ? 13 : 15 }}
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                  animate={{ rotate: isLoginMenuOpen ? 180 : 0 }}
                  variants={{ rest: { opacity: 0, y: 6, color: "#ffffff" }, hover: { opacity: 1, y: 0, color: "#000000" } }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </motion.button>
              <motion.div
                role="menu"
                aria-label="Sign in options"
                initial={false}
                animate={isLoginMenuOpen ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  top: "calc(100% + 0.65rem)",
                  right: 0,
                  width: 190,
                  padding: "0.45rem",
                  borderRadius: 18,
                  backgroundColor: "rgba(255, 255, 255, 0.96)",
                  border: "1px solid rgba(255, 255, 255, 0.55)",
                  boxShadow: "0 20px 45px -18px rgba(0,0,0,0.45), 0 10px 25px -18px rgba(0,0,0,0.35)",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  pointerEvents: isLoginMenuOpen ? "auto" : "none",
                  transformOrigin: "top right",
                }}
              >
                <DropdownLink href="/talent/login" label="Talent Sign in" />
                <DropdownLink href="/employer/login" label="Recruiter Sign in" />
              </motion.div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

const DropdownLink = ({ href, label }: { href: string; label: string }) => (
  <Link
    href={href}
    role="menuitem"
    style={{
      display: "block",
      padding: "0.75rem 0.9rem",
      borderRadius: 13,
      color: "#111827",
      fontFamily: "Manrope, sans-serif",
      fontSize: 13,
      fontWeight: 650,
      letterSpacing: "-0.018em",
      lineHeight: 1,
      textDecoration: "none",
      whiteSpace: "nowrap",
      transition: "background-color 160ms ease, color 160ms ease",
    }}
    onMouseEnter={(event) => {
      event.currentTarget.style.backgroundColor = "#111827";
      event.currentTarget.style.color = "#ffffff";
    }}
    onMouseLeave={(event) => {
      event.currentTarget.style.backgroundColor = "transparent";
      event.currentTarget.style.color = "#111827";
    }}
  >
    {label}
  </Link>
);
/** Text nav pill — shrinks font and padding on scroll */
const NavPill = ({
  label,
  isScrolled,
  onClick,
}: {
  label: string;
  isScrolled: boolean;
  onClick?: () => void;
}) => {
  const ease = `${NAV.duration} ease`;
  return (
    <motion.div
      style={{
        position: "relative",
        cursor:   "pointer",
        overflow: "hidden",
        borderRadius: 9999,
        padding:  isScrolled ? CONTENT.pillPaddingScrolled : CONTENT.pillPaddingDefault,
        transition: `padding ${ease}`,
      }}
      initial="rest"
      whileHover="hover"
      animate="rest"
      onClick={onClick}
    >
      <motion.div
        style={{ position: "absolute", inset: 0, borderRadius: 9999, backgroundColor: "white" }}
        variants={{ rest: { scaleX: 0, originX: 0 }, hover: { scaleX: 1, originX: 0 } }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      <motion.span
        style={{
          position:      "relative",
          zIndex:        10,
          display:       "block",
          fontFamily:    "Manrope, sans-serif",
          fontSize:      isScrolled ? CONTENT.pillFontScrolled : CONTENT.pillFontDefault,
          fontWeight:    600,
          letterSpacing: "-0.028em",
          lineHeight:    "1.5",
          transition:    `font-size ${ease}`,
          whiteSpace:    "nowrap",
        }}
        variants={{ rest: { color: "#ffffff" }, hover: { color: "#000000" } }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        {label}
      </motion.span>
    </motion.div>
  );
};

export default NavBar;
