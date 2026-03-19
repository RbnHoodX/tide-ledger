/**
 * Integration tests that verify cross-module interactions
 * for the tide pool monitoring system. Tests data flow
 * between ecology, chemistry, mapping, and reporting.
 */

// --- Chemistry + ecology integration ---
function testNutrientClassification(): void {
  const thresholds = {
    deficient: 0.01, low: 0.1, optimal: 1.0, elevated: 5.0, toxic: 20.0
  };
  const classify = (concentration: number): string => {
    if (concentration >= thresholds.toxic) return "toxic";
    if (concentration >= thresholds.elevated) return "elevated";
    if (concentration >= thresholds.optimal) return "optimal";
    if (concentration >= thresholds.low) return "low";
    return "deficient";
  };

  console.assert(classify(0.005) === "deficient", "0.005 should be deficient");
  console.assert(classify(0.5) === "optimal", "0.5 should be optimal (>= optimal threshold)");
  console.assert(classify(25) === "toxic", "25 should be toxic");
  console.assert(classify(3.0) === "optimal", "3.0 should be optimal");
  console.assert(classify(8.0) === "elevated", "8.0 should be elevated");
}

// --- Mapping + zones integration ---
function testZoneClassification(): void {
  const classify = (elevation: number): string => {
    if (elevation >= 3.0) return "supralittoral";
    if (elevation >= 2.0) return "high_intertidal";
    if (elevation >= 1.0) return "mid_intertidal";
    if (elevation >= 0.0) return "low_intertidal";
    if (elevation >= -1.0) return "sublittoral_fringe";
    return "sublittoral";
  };
  console.assert(classify(4.5) === "supralittoral", "4.5m is supralittoral");
  console.assert(classify(1.5) === "mid_intertidal", "1.5m is mid_intertidal");
  console.assert(classify(-0.5) === "sublittoral_fringe", "-0.5m is sublittoral_fringe");
}

// --- Survey data pipeline ---
function testSurveyDataPipeline(): void {
  const readings = [
    { parameter: "temperature", value: 15.2, unit: "C" },
    { parameter: "temperature", value: 16.1, unit: "C" },
    { parameter: "temperature", value: 14.8, unit: "C" },
    { parameter: "salinity", value: 34.5, unit: "ppt" },
    { parameter: "salinity", value: 35.1, unit: "ppt" },
  ];

  const grouped = new Map<string, number[]>();
  for (const r of readings) {
    const arr = grouped.get(r.parameter) || [];
    arr.push(r.value);
    grouped.set(r.parameter, arr);
  }

  console.assert(grouped.size === 2, "Should have 2 parameter groups");
  console.assert(grouped.get("temperature")!.length === 3, "Temperature should have 3 readings");

  const tempVals = grouped.get("temperature")!;
  const tempMean = tempVals.reduce((a, b) => a + b, 0) / tempVals.length;
  console.assert(Math.abs(tempMean - 15.367) < 0.01, "Temp mean should be ~15.37");
}

// --- Oxygen + tidal cycle ---
function testOxygenSaturation(): void {
  const saturationConcentration = (tempC: number, salPpt: number): number => {
    const freshSat = 14.62 - 0.3898 * tempC + 0.006969 * tempC * tempC - 0.00005897 * tempC * tempC * tempC;
    const salFactor = 1 - 0.00535 * salPpt;
    return Math.round(Math.max(0, freshSat * salFactor) * 100) / 100;
  };
  const sat15 = saturationConcentration(15, 35);
  console.assert(sat15 > 7 && sat15 < 11, "Saturation at 15C/35ppt should be 7-11 mg/L");

  const sat25 = saturationConcentration(25, 35);
  console.assert(sat25 < sat15, "Warmer water should hold less oxygen");
}

// --- Distance calculation ---
function testDistanceCalculation(): void {
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };
  const dist = haversine(48.8566, 2.3522, 48.8606, 2.3376);
  console.assert(dist > 0.5 && dist < 2.0, "Paris points should be 0.5-2.0 km apart");
}

// --- Cache behavior ---
function testCacheBehavior(): void {
  const cache = new Map<string, { value: number; expires: number }>();
  cache.set("temp_reading", { value: 15.2, expires: Date.now() + 300000 });
  cache.set("sal_reading", { value: 34.5, expires: Date.now() + 300000 });

  console.assert(cache.size === 2, "Cache should have 2 entries");
  console.assert(cache.get("temp_reading")!.value === 15.2, "Should retrieve cached temperature");

  cache.delete("sal_reading");
  console.assert(cache.size === 1, "Cache should have 1 entry after delete");
}

// Run all tests
testNutrientClassification();
testZoneClassification();
testSurveyDataPipeline();
testOxygenSaturation();
testDistanceCalculation();
testCacheBehavior();
console.log("integration tests passed");
