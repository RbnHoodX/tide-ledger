/**
 * Comparative analysis tools for tide pool survey reports.
 * Generates side-by-side comparisons of pools, time periods,
 * and environmental parameters for trend identification.
 */

export interface ComparisonMetric {
  readonly name: string;
  readonly valueA: number;
  readonly valueB: number;
  readonly difference: number;
  readonly percentChange: number;
}

export interface PoolComparison {
  readonly poolIdA: string;
  readonly poolIdB: string;
  readonly metrics: ComparisonMetric[];
  readonly generatedAt: Date;
}

export interface TemporalComparison {
  readonly parameter: string;
  readonly periodA: { start: Date; end: Date; mean: number };
  readonly periodB: { start: Date; end: Date; mean: number };
  readonly trend: "improving" | "declining" | "stable";
}

export function compareMetric(
  name: string,
  valueA: number,
  valueB: number
): ComparisonMetric {
  const difference = Math.round((valueB - valueA) * 10000) / 10000;
  const base = Math.max(Math.abs(valueA), 0.0001);
  const percentChange = Math.round((difference / base) * 10000) / 100;
  return { name, valueA, valueB, difference, percentChange };
}

export function buildPoolComparison(
  poolIdA: string,
  poolIdB: string,
  metricsA: Map<string, number>,
  metricsB: Map<string, number>
): PoolComparison {
  const allKeys = new Set([...metricsA.keys(), ...metricsB.keys()]);
  const metrics: ComparisonMetric[] = [];
  for (const key of allKeys) {
    const a = metricsA.get(key) ?? 0;
    const b = metricsB.get(key) ?? 0;
    metrics.push(compareMetric(key, a, b));
  }
  return {
    poolIdA,
    poolIdB,
    metrics: metrics.sort((a, b) => a.name.localeCompare(b.name)),
    generatedAt: new Date(),
  };
}

export function classifyTrend(
  previousMean: number,
  currentMean: number,
  threshold: number = 0.05
): "improving" | "declining" | "stable" {
  const base = Math.max(Math.abs(previousMean), 0.0001);
  const change = (currentMean - previousMean) / base;
  if (change > threshold) return "improving";
  if (change < -threshold) return "declining";
  return "stable";
}

export function buildTemporalComparison(
  parameter: string,
  periodAStart: Date,
  periodAEnd: Date,
  valuesA: number[],
  periodBStart: Date,
  periodBEnd: Date,
  valuesB: number[]
): TemporalComparison {
  const meanA = valuesA.length > 0
    ? valuesA.reduce((a, b) => a + b, 0) / valuesA.length
    : 0;
  const meanB = valuesB.length > 0
    ? valuesB.reduce((a, b) => a + b, 0) / valuesB.length
    : 0;
  return {
    parameter,
    periodA: { start: periodAStart, end: periodAEnd, mean: Math.round(meanA * 1000) / 1000 },
    periodB: { start: periodBStart, end: periodBEnd, mean: Math.round(meanB * 1000) / 1000 },
    trend: classifyTrend(meanA, meanB),
  };
}

export function significantChanges(
  metrics: ComparisonMetric[],
  minPercentChange: number = 10
): ComparisonMetric[] {
  return metrics.filter(
    (m) => Math.abs(m.percentChange) >= minPercentChange
  );
}

export function rankByChange(metrics: ComparisonMetric[]): ComparisonMetric[] {
  return [...metrics].sort(
    (a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange)
  );
}

export function comparisonSummary(comparison: PoolComparison): string {
  const lines: string[] = [];
  lines.push(`Comparison: ${comparison.poolIdA} vs ${comparison.poolIdB}`);
  lines.push(`Generated: ${comparison.generatedAt.toISOString()}`);
  lines.push("");
  for (const m of comparison.metrics) {
    const arrow = m.difference > 0 ? "+" : "";
    lines.push(`  ${m.name}: ${m.valueA} -> ${m.valueB} (${arrow}${m.percentChange}%)`);
  }
  return lines.join("\n");
}

export function overallHealthTrend(
  comparisons: TemporalComparison[]
): "improving" | "declining" | "stable" {
  let score = 0;
  for (const c of comparisons) {
    if (c.trend === "improving") score++;
    if (c.trend === "declining") score--;
  }
  if (score > 0) return "improving";
  if (score < 0) return "declining";
  return "stable";
}
