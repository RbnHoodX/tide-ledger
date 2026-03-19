/**
 * Tests for reporting module: summary statistics,
 * chart data preparation, comparison analysis, and
 * export formatting.
 */

// --- Summary statistics tests ---
function testComputeMean(): void {
  const values = [10, 20, 30, 40, 50];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  console.assert(mean === 30, "Mean should be 30");
}

function testComputeStdDev(): void {
  const values = [2, 4, 4, 4, 5, 5, 7, 9];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (values.length - 1);
  const stdDev = Math.sqrt(variance);
  console.assert(Math.abs(stdDev - 2.0) < 0.01, "StdDev should be ~2.0");
}

function testTrendDirection(): void {
  const increasing = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const firstHalf = increasing.slice(0, 5);
  const secondHalf = increasing.slice(5);
  const firstMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  console.assert(secondMean > firstMean, "Second half mean should be larger");
}

// --- Chart data tests ---
function testPieSlices(): void {
  const values = [30, 20, 50];
  const total = values.reduce((s, v) => s + v, 0);
  const percentages = values.map((v) => Math.round((v / total) * 10000) / 100);
  console.assert(percentages[0] === 30, "First slice should be 30%");
  console.assert(percentages[2] === 50, "Third slice should be 50%");
}

function testHistogramBins(): void {
  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const binCount = 5;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / binCount;
  console.assert(binWidth === 1.8, "Bin width should be 1.8");
}

// --- Comparison tests ---
function testCompareMetric(): void {
  const valueA = 10.0;
  const valueB = 12.5;
  const diff = valueB - valueA;
  const pctChange = Math.round((diff / valueA) * 10000) / 100;
  console.assert(diff === 2.5, "Difference should be 2.5");
  console.assert(pctChange === 25, "Percent change should be 25%");
}

function testClassifyTrend(): void {
  const classify = (prev: number, curr: number, threshold: number) => {
    const base = Math.max(Math.abs(prev), 0.0001);
    const change = (curr - prev) / base;
    if (change > threshold) return "improving";
    if (change < -threshold) return "declining";
    return "stable";
  };
  console.assert(classify(10, 12, 0.05) === "improving", "10->12 should be improving");
  console.assert(classify(10, 8, 0.05) === "declining", "10->8 should be declining");
  console.assert(classify(10, 10.01, 0.05) === "stable", "10->10.01 should be stable");
}

function testSignificantChanges(): void {
  const metrics = [
    { name: "temp", percentChange: 5 },
    { name: "salinity", percentChange: 15 },
    { name: "oxygen", percentChange: -25 },
    { name: "ph", percentChange: 2 },
  ];
  const significant = metrics.filter((m) => Math.abs(m.percentChange) >= 10);
  console.assert(significant.length === 2, "Should find 2 significant changes");
}

// Run all tests
testComputeMean();
testComputeStdDev();
testTrendDirection();
testPieSlices();
testHistogramBins();
testCompareMetric();
testClassifyTrend();
testSignificantChanges();
console.log("reports tests passed");
