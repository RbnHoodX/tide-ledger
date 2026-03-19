/**
 * Biodiversity calculations for tide pool monitoring.
 * Implements standard ecological diversity indices used
 * in marine biology field surveys.
 */

export interface DiversityResult {
  readonly index: number;
  readonly label: string;
  readonly sampleSize: number;
}

export interface AbundanceRecord {
  readonly speciesName: string;
  readonly count: number;
}

/**
 * Shannon-Wiener diversity index (H').
 * H' = -sum(pi * ln(pi)) where pi is the proportion of species i.
 * Higher values indicate greater diversity.
 */
export function shannonIndex(abundances: number[]): number {
  const total = abundances.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;

  let h = 0;
  for (const count of abundances) {
    if (count <= 0) continue;
    const p = count / total;
    h -= p * Math.log(p);
  }
  return Math.round(h * 10000) / 10000;
}

/**
 * Simpson's diversity index (1 - D).
 * Represents the probability that two randomly selected
 * individuals belong to different species.
 */
export function simpsonIndex(abundances: number[]): number {
  const total = abundances.reduce((a, b) => a + b, 0);
  if (total <= 1) return 0;

  let d = 0;
  for (const count of abundances) {
    d += (count * (count - 1)) / (total * (total - 1));
  }
  return Math.round((1 - d) * 10000) / 10000;
}

/**
 * Species richness — the total number of distinct species
 * with at least one observed individual.
 */
export function speciesRichness(abundances: number[]): number {
  return abundances.filter((c) => c > 0).length;
}

/**
 * Pielou's evenness index (J).
 * J = H' / ln(S) where S is species richness.
 * Ranges from 0 (one species dominates) to 1 (all equally abundant).
 */
export function pielouEvenness(abundances: number[]): number {
  const s = speciesRichness(abundances);
  if (s <= 1) return 0;
  const h = shannonIndex(abundances);
  return Math.round((h / Math.log(s)) * 10000) / 10000;
}

/**
 * Compute a full diversity summary from abundance records.
 */
export function diversitySummary(
  records: AbundanceRecord[]
): {
  shannon: DiversityResult;
  simpson: DiversityResult;
  richness: number;
  evenness: number;
  totalIndividuals: number;
} {
  const counts = records.map((r) => r.count);
  const total = counts.reduce((a, b) => a + b, 0);

  return {
    shannon: {
      index: shannonIndex(counts),
      label: "Shannon-Wiener H'",
      sampleSize: total,
    },
    simpson: {
      index: simpsonIndex(counts),
      label: "Simpson 1-D",
      sampleSize: total,
    },
    richness: speciesRichness(counts),
    evenness: pielouEvenness(counts),
    totalIndividuals: total,
  };
}

export function classifyDiversity(shannonH: number): string {
  if (shannonH < 1.0) return "low";
  if (shannonH < 2.0) return "moderate";
  if (shannonH < 3.0) return "high";
  return "very_high";
}
