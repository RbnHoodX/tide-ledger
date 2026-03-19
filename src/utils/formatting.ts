/**
 * String formatting utilities for tide pool data display.
 * Handles common text transformations used across reports,
 * labels, and field log entries.
 */

export function capitalize(text: string): string {
  if (text.length === 0) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function titleCase(text: string): string {
  return text
    .split(/\s+/)
    .map(capitalize)
    .join(" ");
}

export function snakeCase(text: string): string {
  return text
    .trim()
    .replace(/([A-Z])/g, "_$1")
    .replace(/[\s-]+/g, "_")
    .replace(/^_/, "")
    .toLowerCase();
}

export function camelCase(text: string): string {
  const parts = text.split(/[\s_-]+/);
  return parts
    .map((p, i) => (i === 0 ? p.toLowerCase() : capitalize(p)))
    .join("");
}

export function pluralize(word: string, count: number): string {
  if (count === 1) return word;
  if (word.endsWith("s") || word.endsWith("x") || word.endsWith("sh") || word.endsWith("ch")) {
    return word + "es";
  }
  if (word.endsWith("y") && !/[aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + "ies";
  }
  return word + "s";
}

export function padRight(text: string, width: number, char: string = " "): string {
  if (text.length >= width) return text;
  return text + char.repeat(width - text.length);
}

export function padLeft(text: string, width: number, char: string = " "): string {
  if (text.length >= width) return text;
  return char.repeat(width - text.length) + text;
}

export function padCenter(text: string, width: number, char: string = " "): string {
  if (text.length >= width) return text;
  const totalPad = width - text.length;
  const leftPad = Math.floor(totalPad / 2);
  const rightPad = totalPad - leftPad;
  return char.repeat(leftPad) + text + char.repeat(rightPad);
}

export function indent(text: string, spaces: number = 2): string {
  const prefix = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => prefix + line)
    .join("\n");
}

export function wrap(text: string, maxWidth: number = 80): string {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (current.length === 0) {
      current = word;
    } else if (current.length + 1 + word.length <= maxWidth) {
      current += " " + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current.length > 0) {
    lines.push(current);
  }
  return lines.join("\n");
}

export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

export function abbreviate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const words = text.split(/\s+/);
  if (words.length === 1) return text.slice(0, maxLen);
  return words.map((w) => w.charAt(0).toUpperCase()).join("");
}

export function joinWithAnd(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return items.slice(0, -1).join(", ") + ", and " + items[items.length - 1];
}
