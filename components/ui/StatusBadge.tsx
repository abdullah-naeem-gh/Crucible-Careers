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
    Active: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    Offer: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    
    // Yellow/Amber Statuses
    Draft: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    "Under Review": "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    
    // Orange Statuses
    Paused: "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300",
    
    // Red/Rose Statuses
    Closed: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300",
    Rejected: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300",
    
    // Blue Statuses
    Applied: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
    
    // Purple Statuses
    Interview: "border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300",
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
