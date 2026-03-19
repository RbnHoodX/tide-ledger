/**
 * Sensor calibration management for tide pool monitoring
 * stations. Tracks calibration history, drift correction
 * factors, and maintenance schedules for field instruments.
 */

export type CalibrationStatus = "valid" | "due" | "overdue" | "failed";

export interface CalibrationRecord {
  readonly id: string;
  readonly sensorId: string;
  readonly referenceValue: number;
  readonly measuredValue: number;
  readonly correctionFactor: number;
  readonly performedBy: string;
  readonly calibratedAt: Date;
}

export interface CalibrationSchedule {
  readonly sensorId: string;
  readonly intervalDays: number;
  readonly lastCalibration: Date | null;
  readonly nextDue: Date;
  readonly status: CalibrationStatus;
}

export function computeCorrectionFactor(
  referenceValue: number,
  measuredValue: number
): number {
  if (measuredValue === 0) return 1.0;
  return Math.round((referenceValue / measuredValue) * 100000) / 100000;
}

export function createCalibrationRecord(
  sensorId: string,
  referenceValue: number,
  measuredValue: number,
  performedBy: string
): CalibrationRecord {
  return {
    id: `cal_${sensorId}_${Date.now()}`,
    sensorId,
    referenceValue,
    measuredValue,
    correctionFactor: computeCorrectionFactor(referenceValue, measuredValue),
    performedBy,
    calibratedAt: new Date(),
  };
}

export function applyCorrection(value: number, factor: number): number {
  return Math.round(value * factor * 10000) / 10000;
}

export function calibrationDrift(records: CalibrationRecord[]): number {
  if (records.length < 2) return 0;
  const sorted = [...records].sort(
    (a, b) => a.calibratedAt.getTime() - b.calibratedAt.getTime()
  );
  const first = sorted[0].correctionFactor;
  const last = sorted[sorted.length - 1].correctionFactor;
  return Math.round(Math.abs(last - first) * 100000) / 100000;
}

export function scheduleStatus(
  lastCalibration: Date | null,
  intervalDays: number
): CalibrationStatus {
  if (!lastCalibration) return "overdue";
  const now = Date.now();
  const elapsed = now - lastCalibration.getTime();
  const intervalMs = intervalDays * 86400000;
  if (elapsed > intervalMs * 1.5) return "overdue";
  if (elapsed > intervalMs) return "due";
  return "valid";
}

export function createSchedule(
  sensorId: string,
  intervalDays: number,
  lastCalibration: Date | null
): CalibrationSchedule {
  const status = scheduleStatus(lastCalibration, intervalDays);
  const nextDueMs = lastCalibration
    ? lastCalibration.getTime() + intervalDays * 86400000
    : Date.now();
  return {
    sensorId,
    intervalDays,
    lastCalibration,
    nextDue: new Date(nextDueMs),
    status,
  };
}

export function filterDueSensors(
  schedules: CalibrationSchedule[]
): CalibrationSchedule[] {
  return schedules.filter(
    (s) => s.status === "due" || s.status === "overdue"
  );
}

export function averageCorrectionFactor(records: CalibrationRecord[]): number {
  if (records.length === 0) return 1.0;
  const total = records.reduce((s, r) => s + r.correctionFactor, 0);
  return Math.round((total / records.length) * 100000) / 100000;
}

export function isWithinTolerance(
  correctionFactor: number,
  tolerance: number = 0.05
): boolean {
  return Math.abs(correctionFactor - 1.0) <= tolerance;
}
