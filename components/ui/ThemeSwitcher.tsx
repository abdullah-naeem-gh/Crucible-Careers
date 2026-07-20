"use client";

import { motion } from "framer-motion";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type ThemeMode = "light" | "dark";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => void;
};

// ///////////////////////////////////////////////////////////////////////////
// Custom hook for theme toggle functionality
export const useThemeToggle = ({
  variant = "fade",
  start = "center",
  blur = false,
  gifUrl = "",
  theme,
  onThemeChange,
}: {
  variant?: AnimationVariant;
  start?: AnimationStart;
  blur?: boolean;
  gifUrl?: string;
  theme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
} = {}) => {
  const [internalTheme, setInternalTheme] = useState<ThemeMode>("light");
  const activeTheme = theme ?? internalTheme;
  const isDark = activeTheme === "dark";

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = activeTheme;
  }, [activeTheme, isDark]);

  const styleId = "theme-transition-styles";

  const updateStyles = useCallback((css: string) => {
    if (typeof window === "undefined") return;

    let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;
  }, []);

  const setTheme = useCallback(
    (nextTheme: ThemeMode) => {
      if (onThemeChange) {
        onThemeChange(nextTheme);
      } else {
        setInternalTheme(nextTheme);
      }

      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", nextTheme === "dark");
        document.documentElement.style.colorScheme = nextTheme;
      }
    },
    [onThemeChange],
  );

  const applyThemeWithTransition = useCallback(
    (nextTheme: ThemeMode) => {
      const animation = createAnimation(variant, start, blur, gifUrl);
      updateStyles(animation.css);

      if (typeof document === "undefined") {
        setTheme(nextTheme);
        return;
      }

      const switchTheme = () => {
        flushSync(() => setTheme(nextTheme));
      };
      const viewTransitionDocument = document as ViewTransitionDocument;

      if (!viewTransitionDocument.startViewTransition) {
        switchTheme();
        return;
      }

      viewTransitionDocument.startViewTransition(switchTheme);
    },
    [blur, gifUrl, setTheme, start, updateStyles, variant],
  );

  const toggleTheme = useCallback(() => {
    applyThemeWithTransition(isDark ? "light" : "dark");
  }, [applyThemeWithTransition, isDark]);

  const setCrazyLightTheme = useCallback(() => {
    applyThemeWithTransition("light");
  }, [applyThemeWithTransition]);

  const setCrazyDarkTheme = useCallback(() => {
    applyThemeWithTransition("dark");
  }, [applyThemeWithTransition]);

  const setCrazySystemTheme = useCallback(() => {
    if (typeof window === "undefined") return;
    applyThemeWithTransition(
      window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    );
  }, [applyThemeWithTransition]);

  return {
    isDark,
    setIsDark: (nextIsDark: boolean) => setTheme(nextIsDark ? "dark" : "light"),
    toggleTheme,
    setCrazyLightTheme,
    setCrazyDarkTheme,
    setCrazySystemTheme,
  };
};

// ///////////////////////////////////////////////////////////////////////////

export const ThemeToggleButton = ({
  className = "",
  variant = "fade",
  start = "center",
  blur = false,
  gifUrl = "",
  theme,
  onThemeChange,
}: {
  className?: string;
  variant?: AnimationVariant;
  start?: AnimationStart;
  blur?: boolean;
  gifUrl?: string;
  theme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
}) => {
  const { isDark, toggleTheme } = useThemeToggle({
    variant,
    start,
    blur,
    gifUrl,
    theme,
    onThemeChange,
  });

  return (
    <button
      type="button"
      className={cn(
        "theme-switcher-button flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-all duration-200",
        isDark
          ? "text-white/60 hover:bg-white/10 hover:text-white"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
        className,
      )}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span className="sr-only">Toggle theme</span>
      <motion.span
        key={isDark ? "moon" : "sun"}
        initial={{ rotate: -90, scale: 0.75, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.75, opacity: 0 }}
        transition={{ ease: "easeInOut", duration: 0.55 }}
      >
        {isDark ? <IconMoon size={18} stroke={1.8} /> : <IconSun size={18} stroke={1.8} />}
      </motion.span>
    </button>
  );
};

// ///////////////////////////////////////////////////////////////////////////

export type AnimationVariant =
  | "circle"
  | "rectangle"
  | "gif"
  | "polygon"
  | "circle-blur"
  | "fade";
export type AnimationStart =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center"
  | "top-center"
  | "bottom-center"
  | "bottom-up"
  | "top-down"
  | "left-right"
  | "right-left";

interface Animation {
  name: string;
  css: string;
}

const getPositionCoords = (position: AnimationStart) => {
  switch (position) {
    case "top-left":
      return { cx: "0", cy: "0" };
    case "top-right":
      return { cx: "40", cy: "0" };
    case "bottom-left":
      return { cx: "0", cy: "40" };
    case "bottom-right":
      return { cx: "40", cy: "40" };
    case "top-center":
      return { cx: "20", cy: "0" };
    case "bottom-center":
      return { cx: "20", cy: "40" };
    case "center":
    case "bottom-up":
    case "top-down":
    case "left-right":
    case "right-left":
      return { cx: "20", cy: "20" };
  }
};

const generateSVG = (variant: AnimationVariant, start: AnimationStart) => {
  if (variant === "circle-blur") {
    const positionCoords = getPositionCoords(start);
    if (!positionCoords) throw new Error(`Invalid start position: ${start}`);
    const { cx, cy } = positionCoords;
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="${cx}" cy="${cy}" r="18" fill="white" filter="url(%23blur)"/></svg>`;
  }

  if (start === "center") return;
  if (variant === "rectangle") return "";

  const positionCoords = getPositionCoords(start);
  if (!positionCoords) throw new Error(`Invalid start position: ${start}`);
  const { cx, cy } = positionCoords;

  if (variant === "circle") {
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="${cx}" cy="${cy}" r="20" fill="white"/></svg>`;
  }

  return "";
};

const getTransformOrigin = (start: AnimationStart) => {
  switch (start) {
    case "top-left":
      return "top left";
    case "top-right":
      return "top right";
    case "bottom-left":
      return "bottom left";
    case "bottom-right":
      return "bottom right";
    case "top-center":
      return "top center";
    case "bottom-center":
      return "bottom center";
    case "center":
    case "bottom-up":
    case "top-down":
    case "left-right":
    case "right-left":
      return "center";
  }
};

export const createAnimation = (
  variant: AnimationVariant,
  start: AnimationStart = "center",
  blur = false,
  url?: string,
): Animation => {
  const svg = generateSVG(variant, start);
  const transformOrigin = getTransformOrigin(start);

  if (variant === "fade") {
    return {
      name: "fade",
      css: `
        ::view-transition-group(root) {
          animation-duration: 0.25s;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        ::view-transition-new(root) {
          animation-name: fade-in;
        }
        ::view-transition-old(root) {
          animation-name: fade-out;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `,
    };
  }

  if (variant === "rectangle") {
    const getClipPath = (direction: AnimationStart) => {
      switch (direction) {
        case "bottom-up":
          return {
            from: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          };
        case "top-down":
          return {
            from: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          };
        case "left-right":
          return {
            from: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
            to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          };
        case "right-left":
          return {
            from: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
            to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          };
        case "top-left":
          return {
            from: "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)",
            to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          };
        case "top-right":
          return {
            from: "polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)",
            to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          };
        case "bottom-left":
          return {
            from: "polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)",
            to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          };
        case "bottom-right":
          return {
            from: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
            to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          };
        default:
          return {
            from: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          };
      }
    };

    const clipPath = getClipPath(start);

    return {
      name: `${variant}-${start}${blur ? "-blur" : ""}`,
      css: `
       ::view-transition-group(root) {
        animation-duration: 1.35s;
        animation-timing-function: var(--expo-out, cubic-bezier(0.16, 1, 0.3, 1));
      }
      ::view-transition-new(root) {
        animation-name: reveal-light-${start}${blur ? "-blur" : ""};
        ${blur ? "filter: blur(2px);" : ""}
      }
      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark-${start}${blur ? "-blur" : ""};
        ${blur ? "filter: blur(2px);" : ""}
      }
      @keyframes reveal-dark-${start}${blur ? "-blur" : ""} {
        from { clip-path: ${clipPath.from}; ${blur ? "filter: blur(8px);" : ""} }
        ${blur ? "50% { filter: blur(4px); }" : ""}
        to { clip-path: ${clipPath.to}; ${blur ? "filter: blur(0px);" : ""} }
      }
      @keyframes reveal-light-${start}${blur ? "-blur" : ""} {
        from { clip-path: ${clipPath.from}; ${blur ? "filter: blur(8px);" : ""} }
        ${blur ? "50% { filter: blur(4px); }" : ""}
        to { clip-path: ${clipPath.to}; ${blur ? "filter: blur(0px);" : ""} }
      }
      `,
    };
  }

  if (variant === "circle" && start === "center") {
    return {
      name: `${variant}-${start}${blur ? "-blur" : ""}`,
      css: `
       ::view-transition-group(root) {
        animation-duration: 1.35s;
        animation-timing-function: var(--expo-out, cubic-bezier(0.16, 1, 0.3, 1));
      }
      ::view-transition-new(root) {
        animation-name: reveal-light${blur ? "-blur" : ""};
        ${blur ? "filter: blur(2px);" : ""}
      }
      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark${blur ? "-blur" : ""};
        ${blur ? "filter: blur(2px);" : ""}
      }
      @keyframes reveal-dark${blur ? "-blur" : ""} {
        from { clip-path: circle(0% at 50% 50%); ${blur ? "filter: blur(8px);" : ""} }
        ${blur ? "50% { filter: blur(4px); }" : ""}
        to { clip-path: circle(100% at 50% 50%); ${blur ? "filter: blur(0px);" : ""} }
      }
      @keyframes reveal-light${blur ? "-blur" : ""} {
        from { clip-path: circle(0% at 50% 50%); ${blur ? "filter: blur(8px);" : ""} }
        ${blur ? "50% { filter: blur(4px); }" : ""}
        to { clip-path: circle(100% at 50% 50%); ${blur ? "filter: blur(0px);" : ""} }
      }
      `,
    };
  }

  if (variant === "gif") {
    return {
      name: `${variant}-${start}`,
      css: `
      ::view-transition-group(root) { animation-timing-function: var(--expo-in, cubic-bezier(0.7, 0, 0.84, 0)); }
      ::view-transition-new(root) { mask: url('${url}') center / 0 no-repeat; animation: scale 3s; }
      ::view-transition-old(root), .dark::view-transition-old(root) { animation: scale 3s; }
      @keyframes scale { 0% { mask-size: 0; } 10% { mask-size: 50vmax; } 90% { mask-size: 50vmax; } 100% { mask-size: 2000vmax; } }`,
    };
  }

  if (variant === "circle" && start !== "center") {
    const getClipPathPosition = (position: AnimationStart) => {
      switch (position) {
        case "top-left":
          return "0% 0%";
        case "top-right":
          return "100% 0%";
        case "bottom-left":
          return "0% 100%";
        case "bottom-right":
          return "100% 100%";
        case "top-center":
          return "50% 0%";
        case "bottom-center":
          return "50% 100%";
        default:
          return "50% 50%";
      }
    };

    const clipPosition = getClipPathPosition(start);

    return {
      name: `${variant}-${start}${blur ? "-blur" : ""}`,
      css: `
       ::view-transition-group(root) {
        animation-duration: 1.55s;
        animation-timing-function: var(--expo-out, cubic-bezier(0.16, 1, 0.3, 1));
      }
      ::view-transition-new(root) {
        animation-name: reveal-light-${start}${blur ? "-blur" : ""};
        ${blur ? "filter: blur(2px);" : ""}
      }
      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark-${start}${blur ? "-blur" : ""};
        ${blur ? "filter: blur(2px);" : ""}
      }
      @keyframes reveal-dark-${start}${blur ? "-blur" : ""} {
        from { clip-path: circle(0% at ${clipPosition}); ${blur ? "filter: blur(8px);" : ""} }
        ${blur ? "50% { filter: blur(4px); }" : ""}
        to { clip-path: circle(150% at ${clipPosition}); ${blur ? "filter: blur(0px);" : ""} }
      }
      @keyframes reveal-light-${start}${blur ? "-blur" : ""} {
        from { clip-path: circle(0% at ${clipPosition}); ${blur ? "filter: blur(8px);" : ""} }
        ${blur ? "50% { filter: blur(4px); }" : ""}
        to { clip-path: circle(150% at ${clipPosition}); ${blur ? "filter: blur(0px);" : ""} }
      }
      `,
    };
  }

  return {
    name: `${variant}-${start}${blur ? "-blur" : ""}`,
    css: `
      ::view-transition-group(root) { animation-timing-function: var(--expo-in, cubic-bezier(0.7, 0, 0.84, 0)); }
      ::view-transition-new(root) {
        mask: url('${svg}') ${start.replace("-", " ")} / 0 no-repeat;
        mask-origin: content-box;
        animation: scale-${start}${blur ? "-blur" : ""} 1.55s;
        transform-origin: ${transformOrigin};
        ${blur ? "filter: blur(2px);" : ""}
      }
      ::view-transition-old(root), .dark::view-transition-old(root) {
        animation: scale-${start}${blur ? "-blur" : ""} 1.55s;
        transform-origin: ${transformOrigin};
        z-index: -1;
      }
      @keyframes scale-${start}${blur ? "-blur" : ""} {
        from { ${blur ? "filter: blur(8px);" : ""} }
        ${blur ? "50% { filter: blur(4px); }" : ""}
        to { mask-size: 2000vmax; ${blur ? "filter: blur(0px);" : ""} }
      }
    `,
  };
};

