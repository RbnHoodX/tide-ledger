/**
 * Alert thresholds and condition checks for tide pool
 * monitoring. Triggers warnings when environmental
 * readings fall outside safe ranges for marine life.
 */

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertCondition = "above_max" | "below_min" | "rate_of_change" | "sensor_offline";

export interface ThresholdConfig {
  readonly parameter: string;
  readonly minSafe: number;
  readonly maxSafe: number;
  readonly minCritical: number;
  readonly maxCritical: number;
  readonly unit: string;
}

export interface Alert {
  readonly id: string;
  readonly severity: AlertSeverity;
  readonly condition: AlertCondition;
  readonly parameter: string;
  readonly value: number;
  readonly threshold: number;
  readonly message: string;
  readonly timestamp: Date;
  acknowledged: boolean;
}

export const TIDE_POOL_THRESHOLDS: ThresholdConfig[] = [
  { parameter: "temperature", minSafe: 8, maxSafe: 22, minCritical: 4, maxCritical: 28, unit: "C" },
  { parameter: "salinity", minSafe: 28, maxSafe: 36, minCritical: 20, maxCritical: 42, unit: "ppt" },
  { parameter: "ph", minSafe: 7.8, maxSafe: 8.3, minCritical: 7.4, maxCritical: 8.6, unit: "pH" },
  { parameter: "dissolved_oxygen", minSafe: 5, maxSafe: 12, minCritical: 3, maxCritical: 15, unit: "mg/L" },
];

let alertCounter = 0;

function nextAlertId(): string {
  alertCounter += 1;
  return `alert_${alertCounter}`;
}

export function checkThreshold(
  parameter: string,
  value: number,
  config: ThresholdConfig
): Alert | null {
  if (value > config.maxCritical || value < config.minCritical) {
    const condition: AlertCondition =
      value > config.maxCritical ? "above_max" : "below_min";
    const threshold =
      value > config.maxCritical ? config.maxCritical : config.minCritical;
    return {
      id: nextAlertId(),
      severity: "critical",
      condition,
      parameter,
      value,
      threshold,
      message: `${parameter} at ${value}${config.unit} exceeds critical threshold (${threshold}${config.unit})`,
      timestamp: new Date(),
      acknowledged: false,
    };
  }

  if (value > config.maxSafe || value < config.minSafe) {
    const condition: AlertCondition =
      value > config.maxSafe ? "above_max" : "below_min";
    const threshold = value > config.maxSafe ? config.maxSafe : config.minSafe;
    return {
      id: nextAlertId(),
      severity: "warning",
      condition,
      parameter,
      value,
      threshold,
      message: `${parameter} at ${value}${config.unit} outside safe range (${config.minSafe}-${config.maxSafe}${config.unit})`,
      timestamp: new Date(),
      acknowledged: false,
    };
  }

  return null;
}

export function checkAllThresholds(
  readings: Record<string, number>
): Alert[] {
  const alerts: Alert[] = [];
  for (const config of TIDE_POOL_THRESHOLDS) {
    const value = readings[config.parameter];
    if (value === undefined) continue;
    const alert = checkThreshold(config.parameter, value, config);
    if (alert !== null) {
      alerts.push(alert);
    }
  }
  return alerts;
}

export function acknowledgeAlert(alert: Alert): void {
  alert.acknowledged = true;
}

export function unresolvedAlerts(alerts: Alert[]): Alert[] {
  return alerts.filter((a) => !a.acknowledged);
}

export function alertsBySeverity(
  alerts: Alert[],
  severity: AlertSeverity
): Alert[] {
  return alerts.filter((a) => a.severity === severity);
}
