/**
 * Salinity measurement and classification for tide pool
 * water chemistry. Provides tools for converting between
 * salinity scales and categorizing water types.
 */

export type WaterType =
  | "freshwater"
  | "oligohaline"
  | "mesohaline"
  | "polyhaline"
  | "euhaline"
  | "hyperhaline";

export type SalinityUnit = "ppt" | "psu" | "g_per_kg";

export interface SalinityReading {
  readonly id: string;
  readonly value: number;
  readonly unit: SalinityUnit;
  readonly temperature: number;
  readonly poolId: string;
  readonly measuredAt: Date;
}

export interface SalinityProfile {
  readonly poolId: string;
  readonly readings: SalinityReading[];
  readonly waterType: WaterType;
  readonly averageSalinity: number;
}

export function classifyWaterType(salinityPpt: number): WaterType {
  if (salinityPpt < 0.5) return "freshwater";
  if (salinityPpt < 5) return "oligohaline";
  if (salinityPpt < 18) return "mesohaline";
  if (salinityPpt < 30) return "polyhaline";
  if (salinityPpt < 40) return "euhaline";
  return "hyperhaline";
}

export function convertToPpt(value: number, unit: SalinityUnit): number {
  switch (unit) {
    case "ppt":
      return value;
    case "psu":
      return value * 1.00488;
    case "g_per_kg":
      return value;
    default:
      return value;
  }
}

export function createReading(
  value: number,
  unit: SalinityUnit,
  temperature: number,
  poolId: string
): SalinityReading {
  return {
    id: `sal_${poolId}_${Date.now()}`,
    value: Math.round(value * 1000) / 1000,
    unit,
    temperature,
    poolId,
    measuredAt: new Date(),
  };
}

export function buildProfile(
  poolId: string,
  readings: SalinityReading[]
): SalinityProfile {
  const pptValues = readings.map((r) => convertToPpt(r.value, r.unit));
  const avg = pptValues.length > 0
    ? pptValues.reduce((a, b) => a + b, 0) / pptValues.length
    : 0;
  return {
    poolId,
    readings: [...readings],
    waterType: classifyWaterType(avg),
    averageSalinity: Math.round(avg * 1000) / 1000,
  };
}

export function salinityVariance(readings: SalinityReading[]): number {
  if (readings.length < 2) return 0;
  const pptValues = readings.map((r) => convertToPpt(r.value, r.unit));
  const mean = pptValues.reduce((a, b) => a + b, 0) / pptValues.length;
  const sqDiffs = pptValues.map((v) => (v - mean) ** 2);
  return sqDiffs.reduce((a, b) => a + b, 0) / (pptValues.length - 1);
}

export function isSalinityStable(
  readings: SalinityReading[],
  maxVariance: number = 2.0
): boolean {
  return salinityVariance(readings) <= maxVariance;
}

export function densityFromSalinity(
  salinityPpt: number,
  temperatureC: number
): number {
  const rho = 1000 + 0.8 * salinityPpt - 0.004 * (temperatureC - 4) ** 2;
  return Math.round(rho * 100) / 100;
}
