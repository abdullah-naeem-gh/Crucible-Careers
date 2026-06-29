"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeToggleButton } from "@/components/ui/ThemeSwitcher";

type DashboardTheme = "light" | "dark";

interface DashboardThemeContextValue {
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
}

interface DashboardThemeProviderProps {
  children: React.ReactNode;
  defaultTheme: DashboardTheme;
  storageKey: string;
}

const DashboardThemeContext = createContext<DashboardThemeContextValue | null>(null);

export function useDashboardTheme() {
  const context = useContext(DashboardThemeContext);
  if (!context) {
    throw new Error("useDashboardTheme must be used inside DashboardThemeProvider");
  }
  return context;
}

export function DashboardThemeSwitcher({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useDashboardTheme();

  return (
    <ThemeToggleButton
      theme={theme}
      onThemeChange={setTheme}
      variant="fade"
      className={className}
    />
  );
}

export default function DashboardThemeProvider({
  children,
  defaultTheme,
  storageKey,
}: DashboardThemeProviderProps) {
  const [theme, setTheme] = useState<DashboardTheme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Load saved theme from localStorage after mounting to avoid SSR hydration mismatch
  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(storageKey);
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }
    } catch {
      /* Ignore storage failures */
    }
    setMounted(true);
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;

    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {
      /* Ignore storage failures; the in-memory theme still works. */
    }
  }, [mounted, storageKey, theme]);

  // Synchronize theme with document.documentElement for full scalability (portals, modals, etc.)
  useEffect(() => {
    if (typeof document === "undefined") return;

    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.classList.toggle("light", !isDark);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const rootClassName = useMemo(
    () => `dashboard-theme-root dashboard-theme-${theme}`,
    [theme],
  );

  const contextValue = useMemo(
    () => ({ theme, setTheme }),
    [theme],
  );

  return (
    <DashboardThemeContext.Provider value={contextValue}>
      <div className={rootClassName} data-dashboard-theme={theme}>
        {children}
      </div>
    </DashboardThemeContext.Provider>
  );
}
