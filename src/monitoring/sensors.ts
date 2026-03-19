/**
 * Sensor data types and reading management for tide pool
 * environmental monitoring stations. Covers the primary
 * abiotic factors tracked in intertidal surveys.
 */

export type SensorType =
  | "temperature"
  | "salinity"
  | "ph"
  | "dissolved_oxygen"
  | "turbidity"
  | "wave_height";

export type SensorStatus = "online" | "offline" | "calibrating" | "error";

export interface SensorReading {
  readonly sensorId: string;
  readonly type: SensorType;
  readonly value: number;
  readonly unit: string;
  readonly timestamp: Date;
}

export interface SensorConfig {
  readonly id: string;
  readonly type: SensorType;
  readonly unit: string;
  readonly minRange: number;
  readonly maxRange: number;
  readonly precision: number;
}

export const DEFAULT_CONFIGS: Record<SensorType, Omit<SensorConfig, "id">> = {
  temperature: { type: "temperature", unit: "C", minRange: -2, maxRange: 40, precision: 0.1 },
  salinity: { type: "salinity", unit: "ppt", minRange: 0, maxRange: 50, precision: 0.01 },
  ph: { type: "ph", unit: "pH", minRange: 0, maxRange: 14, precision: 0.01 },
  dissolved_oxygen: { type: "dissolved_oxygen", unit: "mg/L", minRange: 0, maxRange: 20, precision: 0.1 },
  turbidity: { type: "turbidity", unit: "NTU", minRange: 0, maxRange: 1000, precision: 1 },
  wave_height: { type: "wave_height", unit: "m", minRange: 0, maxRange: 15, precision: 0.01 },
};

export class Sensor {
  readonly id: string;
  readonly config: SensorConfig;
  private status: SensorStatus = "online";
  private readings: SensorReading[] = [];

  constructor(id: string, type: SensorType) {
    this.id = id;
    const defaults = DEFAULT_CONFIGS[type];
    this.config = { id, ...defaults };
  }

  getStatus(): SensorStatus {
    return this.status;
  }

  setStatus(status: SensorStatus): void {
    this.status = status;
  }

  record(value: number): SensorReading {
    if (this.status !== "online") {
      throw new Error(`Sensor ${this.id} is ${this.status}, cannot record`);
    }
    const reading: SensorReading = {
      sensorId: this.id,
      type: this.config.type,
      value: Math.round(value / this.config.precision) * this.config.precision,
      unit: this.config.unit,
      timestamp: new Date(),
    };
    this.readings.push(reading);
    return reading;
  }

  isInRange(value: number): boolean {
    return value >= this.config.minRange && value <= this.config.maxRange;
  }

  getReadings(): SensorReading[] {
    return [...this.readings];
  }

  latestReading(): SensorReading | undefined {
    return this.readings.length > 0
      ? this.readings[this.readings.length - 1]
      : undefined;
  }

  readingCount(): number {
    return this.readings.length;
  }
}

export function createSensorBank(
  prefix: string,
  types: SensorType[]
): Sensor[] {
  return types.map(
    (type, idx) => new Sensor(`${prefix}_${type}_${idx + 1}`, type)
  );
}
