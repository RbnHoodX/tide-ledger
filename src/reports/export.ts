/**
 * Data export utilities for tide pool monitoring records.
 * Supports CSV, JSON, and plain-text tabular output for
 * interoperability with research databases and spreadsheets.
 */

export type ExportFormat = "csv" | "json" | "text";

export interface ExportOptions {
  readonly format: ExportFormat;
  readonly includeHeaders: boolean;
  readonly delimiter: string;
  readonly dateFormat: "iso" | "short" | "unix";
}

export interface DataRow {
  [key: string]: string | number | boolean | Date;
}

export const DEFAULT_OPTIONS: ExportOptions = {
  format: "csv",
  includeHeaders: true,
  delimiter: ",",
  dateFormat: "iso",
};

function formatDateValue(date: Date, style: ExportOptions["dateFormat"]): string {
  switch (style) {
    case "iso":
      return date.toISOString();
    case "short": {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    case "unix":
      return String(Math.floor(date.getTime() / 1000));
  }
}

function cellValue(val: string | number | boolean | Date, dateFormat: ExportOptions["dateFormat"]): string {
  if (val instanceof Date) return formatDateValue(val, dateFormat);
  if (typeof val === "boolean") return val ? "true" : "false";
  return String(val);
}

export function toCsv(
  rows: DataRow[],
  options: Partial<ExportOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  if (rows.length === 0) return "";

  const columns = Object.keys(rows[0]);
  const lines: string[] = [];

  if (opts.includeHeaders) {
    lines.push(columns.join(opts.delimiter));
  }

  for (const row of rows) {
    const cells = columns.map((col) => {
      const raw = cellValue(row[col], opts.dateFormat);
      if (raw.includes(opts.delimiter) || raw.includes('"') || raw.includes("\n")) {
        return `"${raw.replace(/"/g, '""')}"`;
      }
      return raw;
    });
    lines.push(cells.join(opts.delimiter));
  }

  return lines.join("\n") + "\n";
}

export function toJson(rows: DataRow[], pretty: boolean = true): string {
  if (pretty) {
    return JSON.stringify(rows, null, 2);
  }
  return JSON.stringify(rows);
}

export function toTextTable(rows: DataRow[]): string {
  if (rows.length === 0) return "(no data)\n";

  const columns = Object.keys(rows[0]);
  const widths = columns.map((col) => {
    const valLengths = rows.map((r) => String(r[col] ?? "").length);
    return Math.max(col.length, ...valLengths);
  });

  const header = columns.map((c, i) => c.padEnd(widths[i])).join("  ");
  const sep = widths.map((w) => "-".repeat(w)).join("--");
  const body = rows.map((row) =>
    columns.map((c, i) => String(row[c] ?? "").padEnd(widths[i])).join("  ")
  );

  return [header, sep, ...body, ""].join("\n");
}

export function exportData(
  rows: DataRow[],
  format: ExportFormat = "csv",
  options: Partial<ExportOptions> = {}
): string {
  switch (format) {
    case "csv":
      return toCsv(rows, options);
    case "json":
      return toJson(rows);
    case "text":
      return toTextTable(rows);
  }
}

export function exportFileName(
  baseName: string,
  format: ExportFormat
): string {
  const ext = format === "text" ? "txt" : format;
  const stamp = new Date().toISOString().slice(0, 10);
  return `${baseName}_${stamp}.${ext}`;
}
