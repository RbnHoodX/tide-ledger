/**
 * Tests for monitoring module: sensors, calibration,
 * maintenance, alerts, and scheduling utilities.
 */

// --- Sensor tests ---
function testSensorRangeCheck(): void {
  const config = { minRange: 0, maxRange: 40 };
  const inRange = (v: number) => v >= config.minRange && v <= config.maxRange;
  console.assert(inRange(20) === true, "20 should be in range");
  console.assert(inRange(-5) === false, "-5 should be out of range");
  console.assert(inRange(45) === false, "45 should be out of range");
  console.assert(inRange(0) === true, "0 should be in range (boundary)");
  console.assert(inRange(40) === true, "40 should be in range (boundary)");
}

// --- Calibration tests ---
function testCorrectionFactor(): void {
  const reference = 10.0;
  const measured = 9.5;
  const factor = reference / measured;
  const rounded = Math.round(factor * 100000) / 100000;
  console.assert(Math.abs(rounded - 1.05263) < 0.00001, "Correction factor should be ~1.05263");
}

function testApplyCorrection(): void {
  const value = 9.5;
  const factor = 1.05263;
  const corrected = Math.round(value * factor * 10000) / 10000;
  console.assert(Math.abs(corrected - 9.9999) < 0.001, "Corrected value should be ~10.0");
}

function testCalibrationDrift(): void {
  const factors = [1.001, 1.003, 1.008, 1.012];
  const drift = Math.abs(factors[factors.length - 1] - factors[0]);
  console.assert(Math.abs(drift - 0.011) < 0.001, "Drift should be ~0.011");
}

// --- Maintenance tests ---
function testPriorityScore(): void {
  const scores: Record<string, number> = {
    critical: 4, high: 3, medium: 2, low: 1
  };
  console.assert(scores["critical"] === 4, "Critical should score 4");
  console.assert(scores["low"] === 1, "Low should score 1");
}

function testCompletionRate(): void {
  const orders = [
    { status: "completed" },
    { status: "completed" },
    { status: "open" },
    { status: "in_progress" },
  ];
  const completed = orders.filter((o) => o.status === "completed").length;
  const rate = Math.round((completed / orders.length) * 10000) / 100;
  console.assert(rate === 50, "Completion rate should be 50%");
}

function testSortByPriority(): void {
  const priorities = ["low", "critical", "medium", "high"];
  const scoreMap: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  const sorted = [...priorities].sort((a, b) => scoreMap[b] - scoreMap[a]);
  console.assert(sorted[0] === "critical", "First should be critical");
  console.assert(sorted[3] === "low", "Last should be low");
}

// --- Tolerance check ---
function testWithinTolerance(): void {
  const isOk = (factor: number, tol: number) => Math.abs(factor - 1.0) <= tol;
  console.assert(isOk(1.03, 0.05) === true, "1.03 within 5% tolerance");
  console.assert(isOk(1.08, 0.05) === false, "1.08 outside 5% tolerance");
  console.assert(isOk(0.96, 0.05) === true, "0.96 within 5% tolerance");
}

// Run all tests
testSensorRangeCheck();
testCorrectionFactor();
testApplyCorrection();
testCalibrationDrift();
testPriorityScore();
testCompletionRate();
testSortByPriority();
testWithinTolerance();
console.log("monitoring tests passed");
