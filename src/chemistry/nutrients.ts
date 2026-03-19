/**
 * Nutrient tracking for tide pool water chemistry analysis.
 * Models the primary macronutrients and micronutrients that
 * drive primary productivity in intertidal ecosystems.
 */

export type NutrientType =
  | "nitrate"
  | "nitrite"
  | "ammonia"
  | "phosphate"
  | "silicate"
  | "iron";

export type NutrientLevel = "deficient" | "low" | "optimal" | "elevated" | "toxic";

export interface NutrientSample {
  readonly id: string;
  readonly type: NutrientType;
  readonly concentration: number;
  readonly unit: string;
  readonly poolId: string;
  readonly collectedAt: Date;
}

export interface NutrientThreshold {
  readonly type: NutrientType;
  readonly deficient: number;
  readonly low: number;
  readonly optimal: number;
  readonly elevated: number;
  readonly toxic: number;
}

export const THRESHOLDS: Record<NutrientType, NutrientThreshold> = {
  nitrate: { type: "nitrate", deficient: 0.01, low: 0.1, optimal: 1.0, elevated: 5.0, toxic: 20.0 },
  nitrite: { type: "nitrite", deficient: 0.001, low: 0.01, optimal: 0.05, elevated: 0.5, toxic: 2.0 },
  ammonia: { type: "ammonia", deficient: 0.005, low: 0.02, optimal: 0.1, elevated: 1.0, toxic: 5.0 },
  phosphate: { type: "phosphate", deficient: 0.005, low: 0.03, optimal: 0.3, elevated: 2.0, toxic: 10.0 },
  silicate: { type: "silicate", deficient: 0.1, low: 0.5, optimal: 3.0, elevated: 15.0, toxic: 50.0 },
  iron: { type: "iron", deficient: 0.001, low: 0.01, optimal: 0.1, elevated: 0.5, toxic: 2.0 },
};

export function classifyLevel(type: NutrientType, concentration: number): NutrientLevel {
  const t = THRESHOLDS[type];
  if (concentration >= t.toxic) return "toxic";
  if (concentration >= t.elevated) return "elevated";
  if (concentration >= t.optimal) return "optimal";
  if (concentration >= t.low) return "low";
  return "deficient";
}

export function createSample(
  type: NutrientType,
  concentration: number,
  poolId: string
): NutrientSample {
  return {
    id: `ns_${type}_${Date.now()}`,
    type,
    concentration: Math.round(concentration * 10000) / 10000,
    unit: "mg/L",
    poolId,
    collectedAt: new Date(),
  };
}

export function nitrogenTotal(samples: NutrientSample[]): number {
  const nitrogenTypes: NutrientType[] = ["nitrate", "nitrite", "ammonia"];
  const relevant = samples.filter((s) => nitrogenTypes.includes(s.type));
  return relevant.reduce((sum, s) => sum + s.concentration, 0);
}

export function redfield_ratio(nitrate: number, phosphate: number): number {
  if (phosphate === 0) return Infinity;
  return nitrate / phosphate;
}

export function isNitrogenLimited(nitrate: number, phosphate: number): boolean {
  const ratio = redfield_ratio(nitrate, phosphate);
  return ratio < 16;
}

export function isPhosphorusLimited(nitrate: number, phosphate: number): boolean {
  const ratio = redfield_ratio(nitrate, phosphate);
  return ratio > 16;
}

export function averageConcentration(samples: NutrientSample[]): number {
  if (samples.length === 0) return 0;
  const total = samples.reduce((s, sample) => s + sample.concentration, 0);
  return Math.round((total / samples.length) * 10000) / 10000;
}

export function filterByType(
  samples: NutrientSample[],
  type: NutrientType
): NutrientSample[] {
  return samples.filter((s) => s.type === type);
}
