/**
 * Organism adaptation tracking for tide pool ecology studies.
 * Models the physiological and behavioral adaptations that
 * intertidal species exhibit in response to environmental
 * stressors such as desiccation, thermal exposure, and wave action.
 */

export type StressorType =
  | "desiccation"
  | "thermal"
  | "wave_action"
  | "salinity_change"
  | "predation"
  | "competition";

export type AdaptationType = "morphological" | "physiological" | "behavioral";

export interface Adaptation {
  readonly id: string;
  readonly speciesId: string;
  readonly stressor: StressorType;
  readonly type: AdaptationType;
  readonly description: string;
  readonly effectiveness: number;
  readonly recordedAt: Date;
}

export interface StressResponse {
  readonly speciesId: string;
  readonly stressor: StressorType;
  readonly intensity: number;
  readonly survivalRate: number;
  readonly adaptations: Adaptation[];
}

export function createAdaptation(
  speciesId: string,
  stressor: StressorType,
  type: AdaptationType,
  description: string,
  effectiveness: number
): Adaptation {
  if (effectiveness < 0 || effectiveness > 1) {
    throw new Error("Effectiveness must be between 0 and 1");
  }
  return {
    id: `adp_${speciesId}_${stressor}_${Date.now()}`,
    speciesId,
    stressor,
    type,
    description,
    effectiveness: Math.round(effectiveness * 1000) / 1000,
    recordedAt: new Date(),
  };
}

export function averageEffectiveness(adaptations: Adaptation[]): number {
  if (adaptations.length === 0) return 0;
  const total = adaptations.reduce((s, a) => s + a.effectiveness, 0);
  return Math.round((total / adaptations.length) * 1000) / 1000;
}

export function filterByStressor(
  adaptations: Adaptation[],
  stressor: StressorType
): Adaptation[] {
  return adaptations.filter((a) => a.stressor === stressor);
}

export function filterByType(
  adaptations: Adaptation[],
  type: AdaptationType
): Adaptation[] {
  return adaptations.filter((a) => a.type === type);
}

export function estimateSurvival(
  baseRate: number,
  adaptations: Adaptation[]
): number {
  let rate = baseRate;
  for (const adp of adaptations) {
    rate += (1 - rate) * adp.effectiveness * 0.3;
  }
  return Math.min(1, Math.round(rate * 1000) / 1000);
}

export function buildStressResponse(
  speciesId: string,
  stressor: StressorType,
  intensity: number,
  adaptations: Adaptation[]
): StressResponse {
  const relevant = filterByStressor(adaptations, stressor);
  const baseSurvival = Math.max(0, 1 - intensity * 0.8);
  return {
    speciesId,
    stressor,
    intensity,
    survivalRate: estimateSurvival(baseSurvival, relevant),
    adaptations: relevant,
  };
}

export function stressorImpactScore(
  stressor: StressorType,
  intensity: number,
  adaptations: Adaptation[]
): number {
  const relevant = filterByStressor(adaptations, stressor);
  const avgEff = averageEffectiveness(relevant);
  const rawImpact = intensity * (1 - avgEff);
  return Math.round(rawImpact * 100) / 100;
}

export function rankByResilience(
  responses: StressResponse[]
): StressResponse[] {
  return [...responses].sort((a, b) => b.survivalRate - a.survivalRate);
}
