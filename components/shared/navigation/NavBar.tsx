"use client";

import { useState, useEffect } from "react";
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
        </div>
      </nav>
    </header>
  );
};

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
