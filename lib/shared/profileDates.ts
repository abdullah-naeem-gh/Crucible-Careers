export const PROFILE_MONTHS = [
  { value: "01", label: "January", shortLabel: "Jan" },
  { value: "02", label: "February", shortLabel: "Feb" },
  { value: "03", label: "March", shortLabel: "Mar" },
  { value: "04", label: "April", shortLabel: "Apr" },
  { value: "05", label: "May", shortLabel: "May" },
  { value: "06", label: "June", shortLabel: "Jun" },
  { value: "07", label: "July", shortLabel: "Jul" },
  { value: "08", label: "August", shortLabel: "Aug" },
  { value: "09", label: "September", shortLabel: "Sep" },
  { value: "10", label: "October", shortLabel: "Oct" },
  { value: "11", label: "November", shortLabel: "Nov" },
  { value: "12", label: "December", shortLabel: "Dec" },
] as const;

export function parseProfileMonthYear(value: string): { month: string; year: string } {
  const trimmed = value.trim();
  const normalized = trimmed.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  if (normalized) return { year: normalized[1], month: normalized[2] };
  if (/^\d{4}$/.test(trimmed)) return { year: trimmed, month: "" };

  const named = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (named) {
    const monthName = named[1].toLowerCase();
    const month = PROFILE_MONTHS.find(
      (item) => item.label.toLowerCase() === monthName || item.shortLabel.toLowerCase() === monthName,
    );
    if (month) return { year: named[2], month: month.value };
  }

  return { month: "", year: "" };
}

export function serializeProfileMonthYear(month: string, year: string): string {
  return month && year ? `${year}-${month}` : year;
}

export function formatProfileMonthYear(value: string): string {
  if (!value) return "";
  const { month, year } = parseProfileMonthYear(value);
  if (!year) return value;
  if (!month) return year;
  const monthLabel = PROFILE_MONTHS.find((item) => item.value === month)?.shortLabel;
  return monthLabel ? `${monthLabel} ${year}` : value;
}
