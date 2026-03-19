/**
 * Species tracking for tide pool ecosystems.
 * Manages biological species records including taxonomy,
 * habitat preferences, and population estimates.
 */

export type HabitatZone =
  | "intertidal_high"
  | "intertidal_mid"
  | "intertidal_low"
  | "subtidal"
  | "splash_zone";

export type ConservationStatus =
  | "least_concern"
  | "near_threatened"
  | "vulnerable"
  | "endangered"
  | "critically_endangered";

export interface SpeciesRecord {
  readonly id: string;
  readonly name: string;
  readonly commonName: string;
  readonly habitat: HabitatZone;
  readonly populationSize: number;
  readonly conservationStatus: ConservationStatus;
  readonly lastSurveyDate: Date;
}

export class Species {
  readonly id: string;
  readonly name: string;
  readonly commonName: string;
  readonly habitat: HabitatZone;
  populationSize: number;
  conservationStatus: ConservationStatus;
  lastSurveyDate: Date;

  constructor(
    id: string,
    name: string,
    commonName: string,
    habitat: HabitatZone,
    populationSize: number,
    conservationStatus: ConservationStatus = "least_concern"
  ) {
    this.id = id;
    this.name = name;
    this.commonName = commonName;
    this.habitat = habitat;
    this.populationSize = populationSize;
    this.conservationStatus = conservationStatus;
    this.lastSurveyDate = new Date();
  }

  updatePopulation(newCount: number): void {
    if (newCount < 0) {
      throw new Error("Population size cannot be negative");
    }
    this.populationSize = newCount;
    this.lastSurveyDate = new Date();
  }

  isEndangered(): boolean {
    return (
      this.conservationStatus === "endangered" ||
      this.conservationStatus === "critically_endangered"
    );
  }

  toRecord(): SpeciesRecord {
    return {
      id: this.id,
      name: this.name,
      commonName: this.commonName,
      habitat: this.habitat,
      populationSize: this.populationSize,
      conservationStatus: this.conservationStatus,
      lastSurveyDate: this.lastSurveyDate,
    };
  }
}

export function createSpecies(
  name: string,
  commonName: string,
  habitat: HabitatZone,
  populationSize: number
): Species {
  const id = `sp_${name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
  return new Species(id, name, commonName, habitat, populationSize);
}

export function filterByHabitat(
  species: Species[],
  zone: HabitatZone
): Species[] {
  return species.filter((s) => s.habitat === zone);
}

export function filterEndangered(species: Species[]): Species[] {
  return species.filter((s) => s.isEndangered());
}

export function totalPopulation(species: Species[]): number {
  return species.reduce((sum, s) => sum + s.populationSize, 0);
}
