"use client";

import React from "react";

export type StatusType =
  | "Active"
  | "Draft"
  | "Paused"
  | "Closed"
  | "Applied"
  | "Under Review"
  | "Interview"
  | "Offer"
  | "Rejected";

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const normalizedStatus = status.trim();

  // Color mappings optimized for both light and dark mode accessibility (WCAG compliant)
  const styles: Record<string, string> = {
    // Green Statuses
    Active: "border-transparent bg-emerald-600 text-white dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    Offer: "border-transparent bg-emerald-600 text-white dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    
    // Yellow/Amber Statuses
    Draft: "border-transparent bg-amber-600 text-white dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    "Under Review": "border-transparent bg-amber-600 text-white dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    
    // Orange Statuses
    Paused: "border-transparent bg-orange-600 text-white dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300",
    
    // Red/Rose Statuses
    Closed: "border-transparent bg-rose-600 text-white dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300",
    Rejected: "border-transparent bg-rose-600 text-white dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300",
    
    // Blue Statuses
    Applied: "border-transparent bg-blue-600 text-white dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
    
    // Purple Statuses
    Interview: "border-transparent bg-purple-600 text-white dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300",
  };

  const statusClass =
    styles[normalizedStatus] ||
    "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700/30 dark:bg-gray-800/10 dark:text-gray-300";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-sm transition-colors duration-200 ${statusClass} ${className}`}
    >
      {normalizedStatus}
    </span>
  );
}
