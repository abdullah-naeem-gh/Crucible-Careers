"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { PROFILE_MONTHS, parseProfileMonthYear, serializeProfileMonthYear } from "@/lib/shared/profileDates";

interface SelectOption {
  value: string;
  label: string;
}

function PickerSelect({
  value,
  options,
  placeholder,
  ariaLabel,
  disabled = false,
  onChange,
}: {
  value: string;
  options: SelectOption[];
  placeholder: string;
  ariaLabel: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((option) => option.value === value)?.label;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="profile-select-trigger flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={selectedLabel ? "" : "opacity-50"}>{selectedLabel || placeholder}</span>
        <IconChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="profile-select-menu absolute left-0 right-0 top-full z-40 max-h-56 overflow-y-auto rounded-xl shadow-[0_18px_45px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-track]:bg-transparent"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`profile-select-option flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left text-sm ${option.value === value ? "profile-select-option-active font-semibold" : ""}`}
              >
                <span>{option.label}</span>
                {option.value === value && <IconCheck size={15} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MonthYearPicker({
  value,
  onChange,
  ariaLabel,
  minYear = 1950,
  maxYear = new Date().getFullYear(),
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
}) {
  const parsed = parseProfileMonthYear(value);
  const [month, setMonth] = useState(parsed.month);
  const [year, setYear] = useState(parsed.year);

  useEffect(() => {
    const next = parseProfileMonthYear(value);
    setMonth(next.month);
    setYear(next.year);
  }, [value]);

  const yearOptions = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, index) => {
      const option = String(maxYear - index);
      return { value: option, label: option };
    }),
    [maxYear, minYear],
  );

  const updateMonth = (nextMonth: string) => {
    setMonth(nextMonth);
    if (year) onChange(serializeProfileMonthYear(nextMonth, year));
  };

  const updateYear = (nextYear: string) => {
    setYear(nextYear);
    onChange(serializeProfileMonthYear(month, nextYear));
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <PickerSelect
        value={month}
        options={PROFILE_MONTHS.map(({ value: optionValue, label }) => ({ value: optionValue, label }))}
        placeholder="Month"
        ariaLabel={`${ariaLabel} month`}
        disabled={disabled}
        onChange={updateMonth}
      />
      <PickerSelect
        value={year}
        options={yearOptions}
        placeholder="Year"
        ariaLabel={`${ariaLabel} year`}
        disabled={disabled}
        onChange={updateYear}
      />
    </div>
  );
}
