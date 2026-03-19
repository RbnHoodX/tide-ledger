/**
 * Simple food web modeling for tide pool ecosystems.
 * Tracks predator-prey and producer-consumer relationships
 * between species in intertidal communities.
 */

export type TrophicLevel =
  | "primary_producer"
  | "primary_consumer"
  | "secondary_consumer"
  | "tertiary_consumer"
  | "decomposer";

export interface Organism {
  readonly name: string;
  readonly trophicLevel: TrophicLevel;
  readonly biomassKg: number;
}

export interface FeedingLink {
  readonly predator: string;
  readonly prey: string;
  readonly interactionStrength: number; // 0.0 to 1.0
}

export class FoodWeb {
  private organisms: Map<string, Organism> = new Map();
  private links: FeedingLink[] = [];

  addOrganism(organism: Organism): void {
    if (this.organisms.has(organism.name)) {
      throw new Error(`Organism '${organism.name}' already exists in the web`);
    }
    this.organisms.set(organism.name, organism);
  }

  addLink(
    predatorName: string,
    preyName: string,
    strength: number = 0.5
  ): void {
    if (!this.organisms.has(predatorName)) {
      throw new Error(`Unknown predator: ${predatorName}`);
    }
    if (!this.organisms.has(preyName)) {
      throw new Error(`Unknown prey: ${preyName}`);
    }
    if (strength < 0 || strength > 1) {
      throw new Error("Interaction strength must be between 0 and 1");
    }
    this.links.push({
      predator: predatorName,
      prey: preyName,
      interactionStrength: strength,
    });
  }

  getPreyOf(predatorName: string): string[] {
    return this.links
      .filter((l) => l.predator === predatorName)
      .map((l) => l.prey);
  }

  getPredatorsOf(preyName: string): string[] {
    return this.links
      .filter((l) => l.prey === preyName)
      .map((l) => l.predator);
  }

  getOrganism(name: string): Organism | undefined {
    return this.organisms.get(name);
  }

  allOrganisms(): Organism[] {
    return Array.from(this.organisms.values());
  }

  allLinks(): FeedingLink[] {
    return [...this.links];
  }

  /**
   * Connectance = actual links / possible links.
   * A standard measure of food web complexity.
   */
  connectance(): number {
    const n = this.organisms.size;
    if (n < 2) return 0;
    const possibleLinks = n * (n - 1);
    return this.links.length / possibleLinks;
  }

  /**
   * Returns organisms at a given trophic level.
   */
  byTrophicLevel(level: TrophicLevel): Organism[] {
    return this.allOrganisms().filter((o) => o.trophicLevel === level);
  }

  /**
   * Total biomass across the entire web.
   */
  totalBiomass(): number {
    let sum = 0;
    for (const org of this.organisms.values()) {
      sum += org.biomassKg;
    }
    return sum;
  }

  /**
   * Link density = links / species count.
   */
  linkDensity(): number {
    const n = this.organisms.size;
    if (n === 0) return 0;
    return this.links.length / n;
  }
}

export function trophicLevelRank(level: TrophicLevel): number {
  const ranks: Record<TrophicLevel, number> = {
    primary_producer: 1,
    decomposer: 1,
    primary_consumer: 2,
    secondary_consumer: 3,
    tertiary_consumer: 4,
  };
  return ranks[level];
}
