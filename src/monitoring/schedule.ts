/**
 * Monitoring schedule management for tide pool field stations.
 * Handles survey timing, recurring observation windows,
 * and tide-dependent sampling schedules.
 */

export type TidePhase =
  | "high_tide"
  | "low_tide"
  | "incoming"
  | "outgoing";

export type Frequency =
  | "hourly"
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly";

export interface ScheduleEntry {
  readonly id: string;
  readonly poolName: string;
  readonly frequency: Frequency;
  readonly preferredTidePhase: TidePhase | null;
  readonly parameters: string[];
  readonly assignedTo: string;
  nextDue: Date;
  readonly active: boolean;
}

export interface CompletedSurvey {
  readonly scheduleId: string;
  readonly completedAt: Date;
  readonly completedBy: string;
  readonly notes: string;
}

let scheduleCounter = 0;

export function createScheduleEntry(
  poolName: string,
  frequency: Frequency,
  parameters: string[],
  assignedTo: string,
  preferredTidePhase: TidePhase | null = null
): ScheduleEntry {
  scheduleCounter += 1;
  return {
    id: `sched_${scheduleCounter}`,
    poolName,
    frequency,
    preferredTidePhase,
    parameters,
    assignedTo,
    nextDue: new Date(),
    active: true,
  };
}

export function frequencyToMs(frequency: Frequency): number {
  const HOUR = 3_600_000;
  const DAY = 24 * HOUR;
  switch (frequency) {
    case "hourly":
      return HOUR;
    case "daily":
      return DAY;
    case "weekly":
      return 7 * DAY;
    case "biweekly":
      return 14 * DAY;
    case "monthly":
      return 30 * DAY;
  }
}

export function advanceSchedule(entry: ScheduleEntry): void {
  const interval = frequencyToMs(entry.frequency);
  entry.nextDue = new Date(entry.nextDue.getTime() + interval);
}

export function isOverdue(entry: ScheduleEntry): boolean {
  return entry.active && entry.nextDue.getTime() < Date.now();
}

export function overdueEntries(entries: ScheduleEntry[]): ScheduleEntry[] {
  return entries.filter(isOverdue);
}

export function entriesForPool(
  entries: ScheduleEntry[],
  poolName: string
): ScheduleEntry[] {
  return entries.filter(
    (e) => e.poolName.toLowerCase() === poolName.toLowerCase()
  );
}

export function entriesByAssignee(
  entries: ScheduleEntry[],
  assignee: string
): ScheduleEntry[] {
  return entries.filter(
    (e) => e.assignedTo.toLowerCase() === assignee.toLowerCase()
  );
}

export function completeSurvey(
  entry: ScheduleEntry,
  completedBy: string,
  notes: string = ""
): CompletedSurvey {
  const survey: CompletedSurvey = {
    scheduleId: entry.id,
    completedAt: new Date(),
    completedBy,
    notes,
  };
  advanceSchedule(entry);
  return survey;
}

export function sortByNextDue(entries: ScheduleEntry[]): ScheduleEntry[] {
  return [...entries].sort(
    (a, b) => a.nextDue.getTime() - b.nextDue.getTime()
  );
}
