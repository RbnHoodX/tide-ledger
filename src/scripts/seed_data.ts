/**
 * Sample data generator for tide pool ecosystem tracker.
 * Produces realistic mock data for development, testing,
 * and demonstration of the monitoring system.
 */

export interface SeedPool {
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly depth: number;
  readonly substrate: string;
}

export interface SeedSpecies {
  readonly name: string;
  readonly commonName: string;
  readonly habitat: string;
  readonly typicalPopulation: number;
}

export interface SeedReading {
  readonly poolName: string;
  readonly temperature: number;
  readonly salinity: number;
  readonly ph: number;
  readonly dissolvedOxygen: number;
  readonly timestamp: Date;
}

export const SAMPLE_POOLS: SeedPool[] = [
  { name: "Anemone Cove", latitude: 36.6219, longitude: -121.9042, depth: 0.4, substrate: "granite" },
  { name: "Mussel Point", latitude: 36.6185, longitude: -121.9018, depth: 0.25, substrate: "basalt" },
  { name: "Kelp Hollow", latitude: 36.6247, longitude: -121.9066, depth: 0.8, substrate: "sandstone" },
  { name: "Urchin Shelf", latitude: 36.6201, longitude: -121.9055, depth: 0.35, substrate: "granite" },
  { name: "Barnacle Ledge", latitude: 36.6230, longitude: -121.9030, depth: 0.15, substrate: "shale" },
];

export const SAMPLE_SPECIES: SeedSpecies[] = [
  { name: "Anthopleura elegantissima", commonName: "Aggregating anemone", habitat: "intertidal_mid", typicalPopulation: 150 },
  { name: "Mytilus californianus", commonName: "California mussel", habitat: "intertidal_mid", typicalPopulation: 500 },
  { name: "Pisaster ochraceus", commonName: "Ochre sea star", habitat: "intertidal_low", typicalPopulation: 12 },
  { name: "Strongylocentrotus purpuratus", commonName: "Purple sea urchin", habitat: "intertidal_low", typicalPopulation: 45 },
  { name: "Balanus glandula", commonName: "Acorn barnacle", habitat: "intertidal_high", typicalPopulation: 800 },
  { name: "Pagurus samuelis", commonName: "Blue-banded hermit crab", habitat: "intertidal_low", typicalPopulation: 30 },
  { name: "Nucella emarginata", commonName: "Emarginate dogwinkle", habitat: "intertidal_mid", typicalPopulation: 60 },
  { name: "Lottia gigantea", commonName: "Owl limpet", habitat: "intertidal_high", typicalPopulation: 25 },
];

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

export function generateReadings(
  poolName: string,
  count: number,
  startDate: Date = new Date("2024-01-01")
): SeedReading[] {
  const readings: SeedReading[] = [];
  const baseTemp = randomBetween(12, 16);
  const baseSalinity = randomBetween(32, 35);

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(
      startDate.getTime() + i * 24 * 60 * 60 * 1000
    );
    readings.push({
      poolName,
      temperature: Math.round((baseTemp + randomBetween(-3, 5)) * 10) / 10,
      salinity: Math.round((baseSalinity + randomBetween(-2, 2)) * 100) / 100,
      ph: Math.round(randomBetween(7.8, 8.3) * 100) / 100,
      dissolvedOxygen: Math.round(randomBetween(5.5, 9.5) * 10) / 10,
      timestamp,
    });
  }
  return readings;
}

export function generatePopulationCounts(
  species: SeedSpecies
): number[] {
  const counts: number[] = [];
  let current = species.typicalPopulation;
  for (let month = 0; month < 12; month++) {
    const drift = randomInt(-Math.floor(current * 0.15), Math.floor(current * 0.15));
    current = Math.max(1, current + drift);
    counts.push(current);
  }
  return counts;
}

export function generateFullDataset(): {
  pools: SeedPool[];
  species: SeedSpecies[];
  readings: SeedReading[];
} {
  const allReadings: SeedReading[] = [];
  for (const pool of SAMPLE_POOLS) {
    allReadings.push(...generateReadings(pool.name, 30));
  }
  return {
    pools: SAMPLE_POOLS,
    species: SAMPLE_SPECIES,
    readings: allReadings,
  };
}
