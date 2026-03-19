/**
 * Chart data preparation for tide pool survey reports.
 * Transforms raw monitoring data into structured series
 * suitable for rendering in various output formats.
 */

export interface DataSeries {
  readonly name: string;
  readonly unit: string;
  readonly values: number[];
  readonly timestamps: Date[];
}

export interface ChartData {
  readonly title: string;
  readonly xLabel: string;
  readonly yLabel: string;
  readonly series: DataSeries[];
}

export interface PieSlice {
  readonly label: string;
  readonly value: number;
  readonly percentage: number;
}

export interface HistogramBin {
  readonly lower: number;
  readonly upper: number;
  readonly count: number;
}

export function createSeries(
  name: string,
  unit: string,
  values: number[],
  timestamps: Date[]
): DataSeries {
  return {
    name,
    unit,
    values: [...values],
    timestamps: [...timestamps],
  };
}

export function createChart(
  title: string,
  xLabel: string,
  yLabel: string,
  series: DataSeries[]
): ChartData {
  return { title, xLabel, yLabel, series: [...series] };
}

export function computePieSlices(
  labels: string[],
  values: number[]
): PieSlice[] {
  const total = values.reduce((s, v) => s + v, 0);
  if (total === 0) return [];
  const count = Math.min(labels.length, values.length);
  const slices: PieSlice[] = [];
  for (let i = 0; i < count; i++) {
    slices.push({
      label: labels[i],
      value: values[i],
      percentage: Math.round((values[i] / total) * 10000) / 100,
    });
  }
  return slices;
}

export function buildHistogram(
  values: number[],
  binCount: number
): HistogramBin[] {
  if (values.length === 0 || binCount <= 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / binCount || 1;
  const bins: HistogramBin[] = [];
  for (let i = 0; i < binCount; i++) {
    const lower = Math.round((min + i * binWidth) * 1000) / 1000;
    const upper = Math.round((min + (i + 1) * binWidth) * 1000) / 1000;
    const count = values.filter((v) => {
      if (i === binCount - 1) return v >= lower && v <= upper;
      return v >= lower && v < upper;
    }).length;
    bins.push({ lower, upper, count });
  }
  return bins;
}

export function seriesRange(series: DataSeries): { min: number; max: number; range: number } {
  if (series.values.length === 0) {
    return { min: 0, max: 0, range: 0 };
  }
  const min = Math.min(...series.values);
  const max = Math.max(...series.values);
  return { min, max, range: max - min };
}

export function downsampleSeries(
  series: DataSeries,
  targetPoints: number
): DataSeries {
  if (series.values.length <= targetPoints) {
    return { ...series, values: [...series.values], timestamps: [...series.timestamps] };
  }
  const step = series.values.length / targetPoints;
  const values: number[] = [];
  const timestamps: Date[] = [];
  for (let i = 0; i < targetPoints; i++) {
    const idx = Math.floor(i * step);
    values.push(series.values[idx]);
    timestamps.push(series.timestamps[idx]);
  }
  return { ...series, values, timestamps };
}

export function mergeCharts(a: ChartData, b: ChartData): ChartData {
  return {
    title: `${a.title} + ${b.title}`,
    xLabel: a.xLabel,
    yLabel: a.yLabel,
    series: [...a.series, ...b.series],
  };
}

export function cumulativeSeries(series: DataSeries): DataSeries {
  let running = 0;
  const cumulative = series.values.map((v) => {
    running += v;
    return Math.round(running * 1000) / 1000;
  });
  return {
    name: `${series.name} (cumulative)`,
    unit: series.unit,
    values: cumulative,
    timestamps: [...series.timestamps],
  };
}
