/**
 * Species migration tracking for tide pool ecosystems.
 * Records seasonal and tidal movement patterns of mobile
 * intertidal organisms between pools and along transects.
 */

export type MigrationTrigger =
  | "seasonal"
  | "tidal"
  | "thermal"
  | "reproductive"
  | "predator_avoidance"
  | "resource_depletion";

export type MovementDirection = "shoreward" | "seaward" | "lateral" | "vertical";

export interface MigrationEvent {
  readonly id: string;
  readonly speciesId: string;
  readonly fromPoolId: string;
  readonly toPoolId: string;
  readonly trigger: MigrationTrigger;
  readonly direction: MovementDirection;
  readonly individualCount: number;
  readonly observedAt: Date;
}

export interface MigrationPattern {
  readonly speciesId: string;
  readonly trigger: MigrationTrigger;
  readonly typicalDirection: MovementDirection;
  readonly frequency: number;
  readonly events: MigrationEvent[];
}

export function recordMigration(
  speciesId: string,
  fromPoolId: string,
  toPoolId: string,
  trigger: MigrationTrigger,
  direction: MovementDirection,
  count: number
): MigrationEvent {
  if (count <= 0) {
    throw new Error("Individual count must be positive");
  }
  return {
    id: `mig_${speciesId}_${Date.now()}`,
    speciesId,
    fromPoolId,
    toPoolId,
    trigger,
    direction,
    individualCount: count,
    observedAt: new Date(),
  };
}

export function totalMigrants(events: MigrationEvent[]): number {
  return events.reduce((sum, e) => sum + e.individualCount, 0);
}

export function filterByTrigger(
  events: MigrationEvent[],
  trigger: MigrationTrigger
): MigrationEvent[] {
  return events.filter((e) => e.trigger === trigger);
}

export function filterBySpecies(
  events: MigrationEvent[],
  speciesId: string
): MigrationEvent[] {
  return events.filter((e) => e.speciesId === speciesId);
}

export function netMovement(
  events: MigrationEvent[],
  poolId: string
): number {
  let net = 0;
  for (const e of events) {
    if (e.toPoolId === poolId) net += e.individualCount;
    if (e.fromPoolId === poolId) net -= e.individualCount;
  }
  return net;
}

export function buildPattern(
  speciesId: string,
  events: MigrationEvent[]
): MigrationPattern {
  const speciesEvents = filterBySpecies(events, speciesId);
  const triggerCounts = new Map<MigrationTrigger, number>();
  const dirCounts = new Map<MovementDirection, number>();

  for (const e of speciesEvents) {
    triggerCounts.set(e.trigger, (triggerCounts.get(e.trigger) || 0) + 1);
    dirCounts.set(e.direction, (dirCounts.get(e.direction) || 0) + 1);
  }

  let topTrigger: MigrationTrigger = "seasonal";
  let topTriggerCount = 0;
  for (const [trigger, count] of triggerCounts) {
    if (count > topTriggerCount) {
      topTrigger = trigger;
      topTriggerCount = count;
    }
  }

  let topDir: MovementDirection = "lateral";
  let topDirCount = 0;
  for (const [dir, count] of dirCounts) {
    if (count > topDirCount) {
      topDir = dir;
      topDirCount = count;
    }
  }

  return {
    speciesId,
    trigger: topTrigger,
    typicalDirection: topDir,
    frequency: speciesEvents.length,
    events: speciesEvents,
  };
}

export function migrationIntensity(events: MigrationEvent[]): number {
  if (events.length === 0) return 0;
  const total = totalMigrants(events);
  return Math.round((total / events.length) * 100) / 100;
}

export function isHighActivity(events: MigrationEvent[], threshold: number = 50): boolean {
  return totalMigrants(events) >= threshold;
}
