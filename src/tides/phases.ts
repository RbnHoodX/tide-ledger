/**
 * Tidal phase tracking and classification for intertidal
 * survey scheduling. Models the standard tidal cycle phases
 * and provides utilities for determining current phase
 * from water level observations.
 */

export type TidalPhase =
  | "high_tide"
  | "ebb_tide"
  | "low_tide"
  | "flood_tide";

export type TidalStrength = "spring" | "neap" | "moderate";

export interface TidalRecord {
  readonly id: string;
  readonly phase: TidalPhase;
  readonly strength: TidalStrength;
  readonly waterLevel: number;
  readonly timestamp: Date;
  readonly stationId: string;
}

export class TidalCycle {
  readonly id: string;
  readonly stationId: string;
  private records: TidalRecord[] = [];
  private currentPhase: TidalPhase = "flood_tide";

  constructor(id: string, stationId: string) {
    this.id = id;
    this.stationId = stationId;
  }

  getPhase(): TidalPhase {
    return this.currentPhase;
  }

  addRecord(waterLevel: number, strength: TidalStrength): TidalRecord {
    const phase = this.classifyPhase(waterLevel);
    const record: TidalRecord = {
      id: `tr_${this.stationId}_${Date.now()}`,
      phase,
      strength,
      waterLevel,
      timestamp: new Date(),
      stationId: this.stationId,
    };
    this.records.push(record);
    this.currentPhase = phase;
    return record;
  }

  private classifyPhase(level: number): TidalPhase {
    const lastLevel = this.records.length > 0
      ? this.records[this.records.length - 1].waterLevel
      : 0;
    const rising = level > lastLevel;
    if (level > 2.5) return "high_tide";
    if (level < 0.5) return "low_tide";
    return rising ? "flood_tide" : "ebb_tide";
  }

  getRecords(): TidalRecord[] {
    return [...this.records];
  }

  recordCount(): number {
    return this.records.length;
  }

  averageWaterLevel(): number {
    if (this.records.length === 0) return 0;
    const total = this.records.reduce((s, r) => s + r.waterLevel, 0);
    return total / this.records.length;
  }

  highTideRecords(): TidalRecord[] {
    return this.records.filter((r) => r.phase === "high_tide");
  }

  lowTideRecords(): TidalRecord[] {
    return this.records.filter((r) => r.phase === "low_tide");
  }

  tidalRange(): number {
    if (this.records.length === 0) return 0;
    const levels = this.records.map((r) => r.waterLevel);
    return Math.max(...levels) - Math.min(...levels);
  }
}

export function createTidalCycle(stationId: string): TidalCycle {
  const id = `tc_${stationId}_${Date.now()}`;
  return new TidalCycle(id, stationId);
}

export function isOptimalSurveyPhase(phase: TidalPhase): boolean {
  return phase === "low_tide" || phase === "ebb_tide";
}
