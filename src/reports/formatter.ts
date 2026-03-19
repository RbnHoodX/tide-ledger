/**
 * Formatting utilities for tide pool monitoring reports.
 * Transforms raw data into human-readable display strings
 * for field reports and dashboard output.
 */

export interface PoolSnapshot {
  readonly name: string;
  readonly temperature: number;
  readonly salinity: number;
  readonly ph: number;
  readonly speciesCount: number;
  readonly surveyDate: Date;
}

export function formatTemperature(celsius: number): string {
  return `${celsius.toFixed(1)}\u00B0C`;
}

export function formatSalinity(ppt: number): string {
  return `${ppt.toFixed(2)} ppt`;
}

export function formatPh(ph: number): string {
  return `pH ${ph.toFixed(2)}`;
}

export function formatCoordinate(degrees: number, direction: string): string {
  const d = Math.floor(Math.abs(degrees));
  const m = Math.floor((Math.abs(degrees) - d) * 60);
  const s = ((Math.abs(degrees) - d - m / 60) * 3600).toFixed(1);
  return `${d}\u00B0${m}'${s}"${direction}`;
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainSec = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainSec}s`;
  const hours = Math.floor(minutes / 60);
  const remainMin = minutes % 60;
  return `${hours}h ${remainMin}m`;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatPoolSnapshot(snap: PoolSnapshot): string {
  const lines = [
    `Pool: ${snap.name}`,
    `  Temperature: ${formatTemperature(snap.temperature)}`,
    `  Salinity:    ${formatSalinity(snap.salinity)}`,
    `  pH:          ${formatPh(snap.ph)}`,
    `  Species:     ${snap.speciesCount}`,
    `  Surveyed:    ${formatDate(snap.surveyDate)}`,
  ];
  return lines.join("\n");
}

export function formatTable(
  headers: string[],
  rows: string[][]
): string {
  const widths = headers.map((h, i) => {
    const colValues = rows.map((r) => (r[i] || "").length);
    return Math.max(h.length, ...colValues);
  });

  const headerLine = headers
    .map((h, i) => h.padEnd(widths[i]))
    .join(" | ");
  const separator = widths.map((w) => "-".repeat(w)).join("-+-");
  const dataLines = rows.map((row) =>
    row.map((cell, i) => (cell || "").padEnd(widths[i])).join(" | ")
  );

  return [headerLine, separator, ...dataLines].join("\n");
}

export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "...";
}

export function padLabel(label: string, width: number = 20): string {
  return label.padEnd(width);
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return "0.0%";
  return ((value / total) * 100).toFixed(1) + "%";
}
