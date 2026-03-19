/**
 * Analysis script for tide pool monitoring data.
 * Performs common analytical tasks such as trend detection,
 * anomaly identification, and cross-pool comparisons.
 */

export interface TimeSeriesPoint {
  readonly timestamp: Date;
  readonly value: number;
}

export interface AnomalyResult {
  readonly index: number;
  readonly value: number;
  readonly expected: number;
  readonly deviation: number;
  readonly timestamp: Date;
}

export interface TrendResult {
  readonly slope: number;
  readonly intercept: number;
  readonly rSquared: number;
  readonly direction: "increasing" | "decreasing" | "stable";
}

export interface ComparisonResult {
  readonly poolA: string;
  readonly poolB: string;
  readonly parameter: string;
  readonly correlation: number;
  readonly meanDifference: number;
}

function mean(vals: number[]): number {
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function stdDev(vals: number[]): number {
  if (vals.length < 2) return 0;
  const m = mean(vals);
  const v = vals.reduce((acc, x) => acc + (x - m) ** 2, 0) / (vals.length - 1);
  return Math.sqrt(v);
}

/**
 * Simple linear regression over a time series.
 * X-values are sequential indices (0, 1, 2, ...).
 */
export function linearTrend(values: number[]): TrendResult {
  const n = values.length;
  if (n < 2) {
    return { slope: 0, intercept: values[0] || 0, rSquared: 0, direction: "stable" };
  }

  const xs = values.map((_, i) => i);
  const xMean = mean(xs);
  const yMean = mean(values);

  let ssXY = 0;
  let ssXX = 0;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    ssXY += (xs[i] - xMean) * (values[i] - yMean);
    ssXX += (xs[i] - xMean) ** 2;
    ssTot += (values[i] - yMean) ** 2;
  }

  const slope = ssXX === 0 ? 0 : ssXY / ssXX;
  const intercept = yMean - slope * xMean;

  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const predicted = intercept + slope * xs[i];
    ssRes += (values[i] - predicted) ** 2;
  }
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  const threshold = stdDev(values) * 0.1;
  let direction: TrendResult["direction"] = "stable";
  if (slope > threshold) direction = "increasing";
  else if (slope < -threshold) direction = "decreasing";

  return {
    slope: Math.round(slope * 10000) / 10000,
    intercept: Math.round(intercept * 10000) / 10000,
    rSquared: Math.round(rSquared * 10000) / 10000,
    direction,
  };
}

/**
 * Detect anomalies using z-score method.
 * Points with |z| > threshold are flagged.
 */
export function detectAnomalies(
  series: TimeSeriesPoint[],
  zThreshold: number = 2.0
): AnomalyResult[] {
  const values = series.map((p) => p.value);
  const m = mean(values);
  const sd = stdDev(values);

  if (sd === 0) return [];

  const anomalies: AnomalyResult[] = [];
  for (let i = 0; i < series.length; i++) {
    const z = Math.abs((series[i].value - m) / sd);
    if (z > zThreshold) {
      anomalies.push({
        index: i,
        value: series[i].value,
        expected: Math.round(m * 100) / 100,
        deviation: Math.round(z * 100) / 100,
        timestamp: series[i].timestamp,
      });
    }
  }
  return anomalies;
}

/**
 * Pearson correlation coefficient between two series.
 */
export function correlation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;

  const aSub = a.slice(0, n);
  const bSub = b.slice(0, n);
  const aMean = mean(aSub);
  const bMean = mean(bSub);

  let num = 0;
  let denA = 0;
  let denB = 0;
  for (let i = 0; i < n; i++) {
    const da = aSub[i] - aMean;
    const db = bSub[i] - bMean;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }

  const denom = Math.sqrt(denA * denB);
  if (denom === 0) return 0;
  return Math.round((num / denom) * 10000) / 10000;
}

/**
 * Compare a parameter between two pools.
 */
export function comparePools(
  poolA: string,
  valuesA: number[],
  poolB: string,
  valuesB: number[],
  parameter: string
): ComparisonResult {
  return {
    poolA,
    poolB,
    parameter,
    correlation: correlation(valuesA, valuesB),
    meanDifference: Math.round((mean(valuesA) - mean(valuesB)) * 1000) / 1000,
  };
}

/**
 * Rolling z-score for adaptive anomaly detection.
 */
export function rollingZScore(
  values: number[],
  window: number
): number[] {
  const zScores: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    const m = mean(slice);
    const sd = stdDev(slice);
    zScores.push(sd === 0 ? 0 : (values[i] - m) / sd);
  }
  return zScores.map((z) => Math.round(z * 100) / 100);
}
