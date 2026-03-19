/**
 * Tidal chart rendering utilities. Generates text-based
 * visualizations of water level data over time for use
 * in terminal reports and log outputs.
 */

export interface ChartPoint {
  readonly label: string;
  readonly value: number;
}

export interface ChartConfig {
  readonly width: number;
  readonly height: number;
  readonly title: string;
  readonly yLabel: string;
  readonly showGrid: boolean;
}

export const DEFAULT_CHART_CONFIG: ChartConfig = {
  width: 60,
  height: 20,
  title: "Tidal Levels",
  yLabel: "meters",
  showGrid: true,
};

export function scaleValue(
  value: number,
  min: number,
  max: number,
  targetMax: number
): number {
  const range = max - min;
  if (range === 0) return 0;
  return Math.round(((value - min) / range) * targetMax);
}

export function generateAsciiChart(
  points: ChartPoint[],
  config: ChartConfig = DEFAULT_CHART_CONFIG
): string[] {
  if (points.length === 0) return ["(no data)"];

  const values = points.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const lines: string[] = [];

  lines.push(`  ${config.title}`);
  lines.push(`  ${config.yLabel}: ${minVal.toFixed(2)} - ${maxVal.toFixed(2)}`);
  lines.push("  " + "-".repeat(config.width));

  const rows = Math.min(config.height, 15);
  for (let row = rows; row >= 0; row--) {
    const threshold = minVal + ((maxVal - minVal) * row) / rows;
    let line = `${threshold.toFixed(1).padStart(6)} |`;
    for (const p of points) {
      if (p.value >= threshold) {
        line += "#";
      } else {
        line += config.showGrid ? "." : " ";
      }
    }
    lines.push(line);
  }

  lines.push("       +" + "-".repeat(points.length));
  return lines;
}

export function renderSparkline(values: number[], width: number = 40): string {
  const blocks = [" ", "\u2581", "\u2582", "\u2583", "\u2584", "\u2585", "\u2586", "\u2587", "\u2588"];
  if (values.length === 0) return "";

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const sampled = resampleValues(values, width);
  return sampled
    .map((v) => {
      const idx = Math.round(((v - min) / range) * (blocks.length - 1));
      return blocks[idx];
    })
    .join("");
}

export function resampleValues(values: number[], targetCount: number): number[] {
  if (values.length <= targetCount) return [...values];
  const result: number[] = [];
  const step = values.length / targetCount;
  for (let i = 0; i < targetCount; i++) {
    const idx = Math.floor(i * step);
    result.push(values[idx]);
  }
  return result;
}

export function formatChartLegend(
  labels: string[],
  colors: string[]
): string[] {
  const lines: string[] = ["  Legend:"];
  for (let i = 0; i < labels.length; i++) {
    const color = i < colors.length ? colors[i] : "default";
    lines.push(`    [${color}] ${labels[i]}`);
  }
  return lines;
}

export function chartPointsFromTimeSeries(
  timestamps: Date[],
  values: number[]
): ChartPoint[] {
  const points: ChartPoint[] = [];
  const count = Math.min(timestamps.length, values.length);
  for (let i = 0; i < count; i++) {
    points.push({
      label: timestamps[i].toISOString().slice(11, 16),
      value: values[i],
    });
  }
  return points;
}
