/**
 * Output formatting utilities for the tide pool monitoring
 * CLI. Handles table rendering, progress indicators, and
 * structured output for terminal display.
 */

export interface TableColumn {
  readonly header: string;
  readonly width: number;
  readonly align: "left" | "right" | "center";
}

export interface TableConfig {
  readonly columns: TableColumn[];
  readonly border: boolean;
  readonly headerSeparator: boolean;
}

export function padCell(text: string, width: number, align: "left" | "right" | "center"): string {
  const truncated = text.length > width ? text.slice(0, width - 1) + "\u2026" : text;
  const padding = width - truncated.length;
  if (padding <= 0) return truncated;
  switch (align) {
    case "right":
      return " ".repeat(padding) + truncated;
    case "center": {
      const left = Math.floor(padding / 2);
      const right = padding - left;
      return " ".repeat(left) + truncated + " ".repeat(right);
    }
    default:
      return truncated + " ".repeat(padding);
  }
}

export function renderTableRow(
  values: string[],
  config: TableConfig
): string {
  const cells = config.columns.map((col, i) => {
    const val = i < values.length ? values[i] : "";
    return padCell(val, col.width, col.align);
  });
  const separator = config.border ? " | " : "  ";
  const line = cells.join(separator);
  return config.border ? `| ${line} |` : line;
}

export function renderTableHeader(config: TableConfig): string[] {
  const lines: string[] = [];
  const headers = config.columns.map((col) =>
    padCell(col.header, col.width, col.align)
  );
  const separator = config.border ? " | " : "  ";
  const headerLine = headers.join(separator);
  lines.push(config.border ? `| ${headerLine} |` : headerLine);
  if (config.headerSeparator) {
    const dashes = config.columns.map((col) => "-".repeat(col.width));
    const dashLine = dashes.join(config.border ? "-+-" : "--");
    lines.push(config.border ? `+-${dashLine}-+` : dashLine);
  }
  return lines;
}

export function renderTable(
  rows: string[][],
  config: TableConfig
): string[] {
  const output: string[] = [];
  output.push(...renderTableHeader(config));
  for (const row of rows) {
    output.push(renderTableRow(row, config));
  }
  return output;
}

export function progressBar(current: number, total: number, width: number = 30): string {
  const fraction = total > 0 ? Math.min(current / total, 1.0) : 0;
  const filled = Math.round(fraction * width);
  const empty = width - filled;
  const bar = "\u2588".repeat(filled) + "\u2591".repeat(empty);
  const pct = Math.round(fraction * 100);
  return `[${bar}] ${pct}% (${current}/${total})`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function indentLines(text: string, spaces: number): string {
  const indent = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => indent + line)
    .join("\n");
}

export function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current.length + word.length + 1 > maxWidth && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = current.length > 0 ? current + " " + word : word;
    }
  }
  if (current.length > 0) lines.push(current);
  return lines;
}
