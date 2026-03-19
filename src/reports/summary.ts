/**
 * Summary statistics generation for tide pool survey data.
 * Aggregates readings across pools and time periods to
 * produce overview metrics for researchers.
 */

export interface ReadingSeries {
  readonly parameter: string;
  readonly values: number[];
  readonly unit: string;
}

export interface SummaryStats {
  readonly parameter: string;
  readonly unit: string;
  readonly count: number;
  readonly min: number;
  readonly max: number;
  readonly mean: number;
  readonly median: number;
  readonly stdDev: number;
}

export interface PoolSummary {
  readonly poolName: string;
  readonly totalSurveys: number;
  readonly speciesObserved: number;
  readonly stats: SummaryStats[];
  readonly generatedAt: Date;
}

export function computeMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

export function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function computeStdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = computeMean(values);
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function summarizeSeries(series: ReadingSeries): SummaryStats {
  const vals = series.values;
  if (vals.length === 0) {
    return {
      parameter: series.parameter,
      unit: series.unit,
      count: 0,
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      stdDev: 0,
    };
  }
  return {
    parameter: series.parameter,
    unit: series.unit,
    count: vals.length,
    min: Math.min(...vals),
    max: Math.max(...vals),
    mean: Math.round(computeMean(vals) * 1000) / 1000,
    median: Math.round(computeMedian(vals) * 1000) / 1000,
    stdDev: Math.round(computeStdDev(vals) * 1000) / 1000,
  };
}

export function generatePoolSummary(
  poolName: string,
  totalSurveys: number,
  speciesObserved: number,
  seriesData: ReadingSeries[]
): PoolSummary {
  return {
    poolName,
    totalSurveys,
    speciesObserved,
    stats: seriesData.map(summarizeSeries),
    generatedAt: new Date(),
  };
}

export function comparePoolStats(
  a: SummaryStats,
  b: SummaryStats
): { parameterA: string; parameterB: string; meanDiff: number; relativeDiff: number } {
  const meanDiff = a.mean - b.mean;
  const base = Math.max(Math.abs(a.mean), Math.abs(b.mean), 0.001);
  return {
    parameterA: a.parameter,
    parameterB: b.parameter,
    meanDiff: Math.round(meanDiff * 1000) / 1000,
    relativeDiff: Math.round((Math.abs(meanDiff) / base) * 10000) / 10000,
  };
}

export function trendDirection(values: number[]): "increasing" | "decreasing" | "stable" {
  if (values.length < 3) return "stable";
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstMean = computeMean(firstHalf);
  const secondMean = computeMean(secondHalf);
  const threshold = computeStdDev(values) * 0.5;
  if (secondMean - firstMean > threshold) return "increasing";
  if (firstMean - secondMean > threshold) return "decreasing";
  return "stable";
}
