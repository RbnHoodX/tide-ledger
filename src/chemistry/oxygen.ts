/**
 * Dissolved oxygen tracking for tide pool water chemistry.
 * Models oxygen saturation, consumption rates, and hypoxia
 * thresholds critical for intertidal organism survival.
 */

export type OxygenStatus = "supersaturated" | "saturated" | "normal" | "low" | "hypoxic" | "anoxic";

export interface OxygenReading {
  readonly id: string;
  readonly dissolvedOxygen: number;
  readonly saturationPercent: number;
  readonly temperature: number;
  readonly salinity: number;
  readonly poolId: string;
  readonly measuredAt: Date;
}

export interface OxygenProfile {
  readonly poolId: string;
  readonly status: OxygenStatus;
  readonly averageDO: number;
  readonly minDO: number;
  readonly maxDO: number;
  readonly readingCount: number;
}

export function saturationConcentration(
  temperatureC: number,
  salinityPpt: number
): number {
  const t = temperatureC;
  const freshSat = 14.62 - 0.3898 * t + 0.006969 * t * t - 0.00005897 * t * t * t;
  const salFactor = 1 - 0.00535 * salinityPpt;
  return Math.round(Math.max(0, freshSat * salFactor) * 100) / 100;
}

export function saturationPercent(
  dissolvedOxygen: number,
  temperatureC: number,
  salinityPpt: number
): number {
  const maxDO = saturationConcentration(temperatureC, salinityPpt);
  if (maxDO === 0) return 0;
  return Math.round((dissolvedOxygen / maxDO) * 10000) / 100;
}

export function classifyOxygenStatus(dissolvedOxygen: number): OxygenStatus {
  if (dissolvedOxygen <= 0.1) return "anoxic";
  if (dissolvedOxygen <= 2.0) return "hypoxic";
  if (dissolvedOxygen <= 4.0) return "low";
  if (dissolvedOxygen <= 8.0) return "normal";
  if (dissolvedOxygen <= 12.0) return "saturated";
  return "supersaturated";
}

export function createOxygenReading(
  dissolvedOxygen: number,
  temperature: number,
  salinity: number,
  poolId: string
): OxygenReading {
  return {
    id: `ox_${poolId}_${Date.now()}`,
    dissolvedOxygen: Math.round(dissolvedOxygen * 100) / 100,
    saturationPercent: saturationPercent(dissolvedOxygen, temperature, salinity),
    temperature,
    salinity,
    poolId,
    measuredAt: new Date(),
  };
}

export function buildOxygenProfile(
  poolId: string,
  readings: OxygenReading[]
): OxygenProfile {
  if (readings.length === 0) {
    return {
      poolId,
      status: "normal",
      averageDO: 0,
      minDO: 0,
      maxDO: 0,
      readingCount: 0,
    };
  }
  const vals = readings.map((r) => r.dissolvedOxygen);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return {
    poolId,
    status: classifyOxygenStatus(avg),
    averageDO: Math.round(avg * 100) / 100,
    minDO: Math.min(...vals),
    maxDO: Math.max(...vals),
    readingCount: readings.length,
  };
}

export function oxygenConsumptionRate(
  startDO: number,
  endDO: number,
  hoursElapsed: number
): number {
  if (hoursElapsed <= 0) return 0;
  return Math.round(((startDO - endDO) / hoursElapsed) * 1000) / 1000;
}

export function isHypoxicRisk(readings: OxygenReading[]): boolean {
  if (readings.length === 0) return false;
  const lowCount = readings.filter((r) => r.dissolvedOxygen < 4.0).length;
  return lowCount / readings.length > 0.25;
}
