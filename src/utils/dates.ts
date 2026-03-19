/**
 * Date and time utilities for tide pool survey scheduling
 * and temporal analysis. Provides helpers for working with
 * survey timestamps, tidal period calculations, and
 * seasonal date ranges.
 */

export type Season = "spring" | "summer" | "autumn" | "winter";

export interface DateRange {
  readonly start: Date;
  readonly end: Date;
}

export function seasonFromMonth(month: number): Season {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export function currentSeason(): Season {
  return seasonFromMonth(new Date().getMonth() + 1);
}

export function daysBetween(a: Date, b: Date): number {
  const ms = Math.abs(b.getTime() - a.getTime());
  return Math.floor(ms / 86400000);
}

export function hoursBetween(a: Date, b: Date): number {
  const ms = Math.abs(b.getTime() - a.getTime());
  return Math.round((ms / 3600000) * 100) / 100;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400000);
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3600000);
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function isWithinRange(date: Date, range: DateRange): boolean {
  return date >= range.start && date <= range.end;
}

export function overlapDays(a: DateRange, b: DateRange): number {
  const start = new Date(Math.max(a.start.getTime(), b.start.getTime()));
  const end = new Date(Math.min(a.end.getTime(), b.end.getTime()));
  if (start > end) return 0;
  return daysBetween(start, end);
}

export function tidalPeriodEnd(start: Date): Date {
  return addHours(start, 12.42);
}

export function nextTidalCycle(current: Date, cycleNumber: number = 1): Date {
  return addHours(current, 12.42 * cycleNumber);
}

export function formatSurveyDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatSurveyTimestamp(date: Date): string {
  const dateStr = formatSurveyDate(date);
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dateStr} ${h}:${min}`;
}

export function parseSurveyDate(str: string): Date {
  const parts = str.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid date format: ${str}`);
  }
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function generateDateRange(start: Date, endDate: Date, stepDays: number): Date[] {
  const dates: Date[] = [];
  let current = new Date(start);
  while (current <= endDate) {
    dates.push(new Date(current));
    current = addDays(current, stepDays);
  }
  return dates;
}

export function groupByMonth(dates: Date[]): Map<string, Date[]> {
  const groups = new Map<string, Date[]>();
  for (const d of dates) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const arr = groups.get(key) || [];
    arr.push(d);
    groups.set(key, arr);
  }
  return groups;
}
