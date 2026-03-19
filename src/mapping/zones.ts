/**
 * Intertidal zone classification and management for
 * tide pool mapping. Defines the vertical zonation
 * scheme used to categorize monitoring sites by their
 * position relative to tidal exposure levels.
 */

export type IntertidalZone =
  | "supralittoral"
  | "high_intertidal"
  | "mid_intertidal"
  | "low_intertidal"
  | "sublittoral_fringe"
  | "sublittoral";

export interface ZoneDefinition {
  readonly zone: IntertidalZone;
  readonly minElevation: number;
  readonly maxElevation: number;
  readonly exposurePercent: number;
  readonly description: string;
}

export interface ZoneAssignment {
  readonly siteId: string;
  readonly zone: IntertidalZone;
  readonly elevation: number;
  readonly assignedAt: Date;
}

export const ZONE_DEFINITIONS: ZoneDefinition[] = [
  { zone: "supralittoral", minElevation: 3.0, maxElevation: 10.0, exposurePercent: 95, description: "Spray zone above high tide" },
  { zone: "high_intertidal", minElevation: 2.0, maxElevation: 3.0, exposurePercent: 80, description: "Upper intertidal exposed most of tidal cycle" },
  { zone: "mid_intertidal", minElevation: 1.0, maxElevation: 2.0, exposurePercent: 50, description: "Middle zone with balanced exposure" },
  { zone: "low_intertidal", minElevation: 0.0, maxElevation: 1.0, exposurePercent: 20, description: "Lower zone exposed only at low tide" },
  { zone: "sublittoral_fringe", minElevation: -1.0, maxElevation: 0.0, exposurePercent: 5, description: "Exposed only during extreme low tides" },
  { zone: "sublittoral", minElevation: -10.0, maxElevation: -1.0, exposurePercent: 0, description: "Permanently submerged" },
];

export function classifyZone(elevation: number): IntertidalZone {
  for (const def of ZONE_DEFINITIONS) {
    if (elevation >= def.minElevation && elevation < def.maxElevation) {
      return def.zone;
    }
  }
  if (elevation >= 10.0) return "supralittoral";
  return "sublittoral";
}

export function getZoneDefinition(zone: IntertidalZone): ZoneDefinition {
  const def = ZONE_DEFINITIONS.find((d) => d.zone === zone);
  if (!def) {
    throw new Error(`Unknown zone: ${zone}`);
  }
  return def;
}

export function assignZone(siteId: string, elevation: number): ZoneAssignment {
  return {
    siteId,
    zone: classifyZone(elevation),
    elevation,
    assignedAt: new Date(),
  };
}

export function filterByZone(
  assignments: ZoneAssignment[],
  zone: IntertidalZone
): ZoneAssignment[] {
  return assignments.filter((a) => a.zone === zone);
}

export function exposureTime(zone: IntertidalZone, tidalPeriodHours: number = 12.42): number {
  const def = getZoneDefinition(zone);
  return Math.round((def.exposurePercent / 100) * tidalPeriodHours * 100) / 100;
}

export function submersionTime(zone: IntertidalZone, tidalPeriodHours: number = 12.42): number {
  return Math.round((tidalPeriodHours - exposureTime(zone, tidalPeriodHours)) * 100) / 100;
}

export function zoneStress(zone: IntertidalZone): number {
  const def = getZoneDefinition(zone);
  return Math.round(def.exposurePercent / 10) / 10;
}

export function isHighStressZone(zone: IntertidalZone): boolean {
  return zoneStress(zone) >= 5.0;
}

export function zoneSummary(assignments: ZoneAssignment[]): Map<IntertidalZone, number> {
  const counts = new Map<IntertidalZone, number>();
  for (const a of assignments) {
    counts.set(a.zone, (counts.get(a.zone) || 0) + 1);
  }
  return counts;
}
